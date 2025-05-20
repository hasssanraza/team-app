"use client"

import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TaskActivity({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case "created":
        return "📝"
      case "updated":
        return "✏️"
      case "assigned":
        return "👤"
      case "status_changed":
        return "🔄"
      case "commented":
        return "💬"
      default:
        return "📌"
    }
  }

  const getActivityText = (activity) => {
    switch (activity.type) {
      case "created":
        return "created this task"
      case "updated":
        return "updated the task"
      case "assigned":
        return `assigned the task to ${activity.data.assigneeName}`
      case "status_changed":
        return `changed status to ${activity.data.newStatus.replace("_", " ")}`
      case "commented":
        return "added a comment"
      default:
        return "performed an action"
    }
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity._id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback>
                  {activity.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="w-0.5 h-full bg-border mt-2" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{activity.user.name}</span>
                <span className="text-sm text-muted-foreground">
                  {getActivityText(activity)}
                </span>
                <span className="text-2xl" role="img" aria-label={activity.type}>
                  {getActivityIcon(activity.type)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 