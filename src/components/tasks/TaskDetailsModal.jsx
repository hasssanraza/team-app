"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TaskDetailsModal({ task }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState("")

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${task._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      toast.success("Comment added successfully")
      setComment("")
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{task.title}</span>
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {task.status.replace("_", " ")}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
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
          <div className="space-y-2">
            <h3 className="font-semibold">Assigned to</h3>
            <p className="text-sm text-muted-foreground">
              {task.assignee?.name || "Unassigned"}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Comments</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              {task.comments?.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {comment.user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}
            </ScrollArea>
            <form onSubmit={handleAddComment} className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button type="submit" disabled={loading || !comment.trim()}>
                {loading ? "Adding..." : "Add Comment"}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 