"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

const statusColors = {
  todo: "bg-gray-100 text-gray-800",
  in_progress: "bg-purple-100 text-purple-800",
  review: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
}

export function TaskList({ tasks, teamMembers, onSelect }) {
  const getAssigneeName = (assigneeId) => {
    const assignee = teamMembers.find((member) => member._id === assigneeId)
    return assignee ? assignee.name : "Unassigned"
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card
            key={task._id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelect(task)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant="secondary"
                    className={priorityColors[task.priority]}
                  >
                    {task.priority}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={statusColors[task.status]}
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div>Assigned to: {getAssigneeName(task.assignee)}</div>
                <div>
                  Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
} 