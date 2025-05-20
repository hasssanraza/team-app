"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddCommentModal } from "./AddCommentModal"

export function TaskDetailsModal({ task }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update task status")
      }

      toast.success("Task status updated successfully")
      router.refresh()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">View Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Status</h3>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <h3 className="font-semibold">Priority</h3>
              <p className="text-sm text-muted-foreground capitalize">{task.priority}</p>
            </div>
            <div>
              <h3 className="font-semibold">Due Date</h3>
              <p className="text-sm text-muted-foreground">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Assigned To</h3>
              <p className="text-sm text-muted-foreground">
                {task.assignee ? task.assignee.name : "Unassigned"}
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Comments</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              {task.comments && task.comments.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment) => (
                    <div key={comment._id} className="border-b pb-2">
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-muted-foreground">
                        By {comment.user.name} on {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}
            </ScrollArea>
            <div className="mt-4">
              <AddCommentModal taskId={task._id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 