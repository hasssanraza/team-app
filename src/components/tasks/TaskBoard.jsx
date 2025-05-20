"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateTaskModal } from "./CreateTaskModal"
import { TaskCard } from "./TaskCard"
import { TaskList } from "./TaskList"
import { TaskDetailModal } from "./TaskDetailModal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TaskBoard({ teamId }) {
  const [view, setView] = useState("board")
  const [selectedTask, setSelectedTask] = useState(null)
  const queryClient = useQueryClient()

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", teamId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?teamId=${teamId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      return response.json()
    },
  })

  // Fetch team members
  const { data: teamMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/members`)
      if (!response.ok) {
        throw new Error("Failed to fetch team members")
      }
      return response.json()
    },
  })

  const handleTaskCreated = () => {
    queryClient.invalidateQueries(["tasks", teamId])
  }

  const handleTaskUpdate = () => {
    queryClient.invalidateQueries(["tasks", teamId])
    if (selectedTask) {
      queryClient.invalidateQueries(["task", selectedTask._id])
    }
  }

  if (tasksLoading || membersLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CreateTaskModal
          teamId={teamId}
          teamMembers={teamMembers}
          onTaskCreated={handleTaskCreated}
        />
      </div>

      <Tabs value={view} onValueChange={setView} className="w-full">
        <TabsList>
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                teamMembers={teamMembers}
                onSelect={setSelectedTask}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <TaskList
            tasks={tasks}
            teamMembers={teamMembers}
            onSelect={setSelectedTask}
          />
        </TabsContent>
      </Tabs>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          teamMembers={teamMembers}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  )
} 