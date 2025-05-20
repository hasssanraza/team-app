"use client"

import { useState, useEffect } from "react"
import { CreateTaskModal } from "@/components/modals/CreateTaskModal"
import TaskCard from "./TaskCard"
import { Button } from "@/components/ui/button"

const statusColumns = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "completed", label: "Completed" },
]

export default function TaskBoard({ teams }) {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?._id)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (selectedTeam) {
      fetchTasks()
    } else {
      setTasks([])
      setLoading(false)
    }
  }, [selectedTeam])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/tasks?team=${selectedTeam}`, {
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch tasks")
      const data = await response.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setError("Failed to load tasks")
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain")
    const task = tasks.find((t) => t._id === taskId)
    
    if (task && task.status !== newStatus) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
          credentials: "include",
        })

        if (!response.ok) throw new Error("Failed to update task status")
        
        // Update local state
        setTasks(tasks.map((t) => 
          t._id === taskId ? { ...t, status: newStatus } : t
        ))
      } catch (error) {
        console.error("Error updating task status:", error)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={selectedTeam || ""}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2"
          >
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
          {selectedTeam && <CreateTaskModal teamId={selectedTeam} />}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statusColumns.map((column) => (
          <div
            key={column.id}
            className="space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <h3 className="font-semibold">{column.label}</h3>
            <div className="space-y-4 min-h-[200px]">
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : error ? (
                <div className="text-center py-4 text-destructive">{error}</div>
              ) : (
                tasks
                  .filter((task) => task.status === column.id)
                  .map((task) => (
                    <TaskCard key={task._id} task={task} />
                  ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 