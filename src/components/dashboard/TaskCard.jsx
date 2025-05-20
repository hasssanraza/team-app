"use client"

import { useState } from "react"
import { TaskDetailsModal } from "@/components/modals/TaskDetailsModal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
}

export default function TaskCard({ task }) {
  const [isDragging, setIsDragging] = useState(false)

  if (!task) {
    return null
  }

  const handleDragStart = (e) => {
    setIsDragging(true)
    e.dataTransfer.setData("text/plain", task._id)
  }

  return (
    <div
      className={`p-4 rounded-lg border bg-card text-card-foreground shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-semibold leading-none">{task.title || "Untitled Task"}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description || "No description provided"}
          </p>
        </div>
        <TaskDetailsModal task={task} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={priorityColors[task.priority || "medium"]}>
            {task.priority || "medium"}
          </Badge>
          {task.dueDate && (
            <Badge variant="outline">
              {new Date(task.dueDate).toLocaleDateString()}
            </Badge>
          )}
        </div>
        {task.assignee && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
              {task.assignee.name?.charAt(0) || "?"}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 