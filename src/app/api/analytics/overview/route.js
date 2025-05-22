import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get team members count
    const teamMembers = await User.countDocuments();

    // Get total tasks
    const totalTasks = await Task.countDocuments();

    // Get completed tasks
    const completedTasks = await Task.countDocuments({ status: 'completed' });

    // Get pending tasks (tasks that are not completed)
    const pendingTasks = await Task.countDocuments({ status: { $ne: 'completed' } });

    // Get task trend for the last 7 days
    const taskTrend = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const [created, completed] = await Promise.all([
          Task.countDocuments({
            createdAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          }),
          Task.countDocuments({
            status: 'completed',
            updatedAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          }),
        ]);

        return {
          date: startOfDay.toISOString().split('T')[0],
          created,
          completed,
        };
      })
    );

    return NextResponse.json({
      teamMembers,
      totalTasks,
      completedTasks,
      pendingTasks,
      taskTrend: taskTrend.reverse(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 