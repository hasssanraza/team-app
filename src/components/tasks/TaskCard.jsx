"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AssignTaskModal } from "./AssignTaskModal"
import { TaskDetailsModal } from "./TaskDetailsModal"

export function TaskCard({ task, teamMembers }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update task status")
      }

      toast.success("Task status updated")
      router.refresh()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-500"
      case "in_progress":
        return "bg-blue-500"
      case "review":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{task.title}</span>
          <Badge variant="outline" className={getStatusColor(task.status)}>
            {task.status.replace("_", " ")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            {task.dueDate && (
              <Badge variant="outline">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
          {task.assignee && (
            <div className="text-sm text-muted-foreground">
              Assigned to: {task.assignee.name}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <AssignTaskModal task={task} teamMembers={teamMembers} />
          <TaskDetailsModal task={task} />
        </div>
        <div className="flex gap-2">
          {task.status !== "completed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("completed")}
              disabled={loading}
            >
              Complete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
} 