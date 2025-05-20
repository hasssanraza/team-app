"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TaskAssignment({ task, teamMembers, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const queryClient = useQueryClient()

  const handleAssigneeChange = async (assigneeId) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignee: assigneeId }),
      })

      if (!response.ok) {
        throw new Error("Failed to update assignee")
      }

      queryClient.invalidateQueries(["task", task._id])
      onUpdate?.()
    } catch (error) {
      console.error("Error updating assignee:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const currentAssignee = teamMembers.find((member) => member._id === task.assignee)

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Assignee</h3>
      <div className="flex items-center gap-4">
        {currentAssignee && (
          <Avatar>
            <AvatarImage src={currentAssignee.avatar} />
            <AvatarFallback>
              {currentAssignee.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        )}
        <Select
          value={task.assignee}
          onValueChange={handleAssigneeChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member._id} value={member._id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 