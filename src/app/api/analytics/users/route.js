import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Task from "@/models/Task"
import User from "@/models/User"

export async function GET() {
  try {
    await connectDB()

    // Get total tasks
    const totalTasks = await Task.countDocuments()

    // Get completed tasks
    const completedTasks = await Task.countDocuments({ status: "completed" })

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      status: { $ne: "completed" },
      dueDate: { $lt: new Date() },
    })

    // Calculate average completion time
    const completedTasksWithDates = await Task.find({
      status: "completed",
      completedAt: { $exists: true },
      createdAt: { $exists: true },
    })

    const avgCompletionTime = completedTasksWithDates.length > 0
      ? Math.round(
          completedTasksWithDates.reduce((acc, task) => {
            const completionTime = task.completedAt - task.createdAt
            return acc + completionTime
          }, 0) / (completedTasksWithDates.length * 1000 * 60 * 60 * 24)
        )
      : 0

    // Get task distribution by priority
    const priorityDistribution = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
        },
      },
    ])

    // Get task distribution by status
    const statusDistribution = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
        },
      },
    ])

    // Get task completion trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const completionTrend = await Promise.all(
      last7Days.map(async (date) => {
        const startDate = new Date(date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)

        const [created, completed] = await Promise.all([
          Task.countDocuments({
            createdAt: { $gte: startDate, $lt: endDate },
          }),
          Task.countDocuments({
            completedAt: { $gte: startDate, $lt: endDate },
          }),
        ])

        return {
          date,
          created,
          completed,
        }
      })
    )

    return NextResponse.json({
      totalTasks,
      completedTasks,
      completionRate,
      overdueTasks,
      avgCompletionTime,
      priorityDistribution,
      statusDistribution,
      completionTrend,
    })
  } catch (error) {
    console.error("Error fetching user analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch user analytics" },
      { status: 500 }
    )
  }
} 