"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskComments } from "./TaskComments"
import { TaskActivity } from "./TaskActivity"
import { TaskAssignment } from "./TaskAssignment"

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

export function TaskDetailModal({ task, teamMembers, open, onOpenChange, onTaskUpdate }) {
  const [activeTab, setActiveTab] = useState("details")

  // Fetch task details with comments and activity
  const { data: taskDetails, isLoading } = useQuery({
    queryKey: ["task", task._id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${task._id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch task details")
      }
      return response.json()
    },
    enabled: !!task._id,
  })

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Loading Task Details</DialogTitle>
          </DialogHeader>
          <div>Please wait while we load the task details...</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
          <DialogDescription>
            Created on {format(new Date(task.createdAt), "MMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Badge variant="secondary" className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
          <Badge variant="secondary" className={statusColors[task.status]}>
            {task.status.replace("_", " ")}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Due Date</h3>
                <p className="text-muted-foreground">
                  {format(new Date(task.dueDate), "MMMM d, yyyy")}
                </p>
              </div>
              <TaskAssignment
                task={task}
                teamMembers={teamMembers}
                onUpdate={onTaskUpdate}
              />
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <TaskComments
              taskId={task._id}
              comments={taskDetails?.comments || []}
              onUpdate={onTaskUpdate}
            />
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <TaskActivity activities={taskDetails?.activities || []} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 