import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import Team from "@/models/Team";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { assigneeId } = await req.json();
    const taskId = params.id;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user is part of the team
    const team = await Team.findById(task.team);
    if (!team.members.includes(session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if assignee is part of the team
    if (!team.members.includes(assigneeId)) {
      return NextResponse.json(
        { error: "Assignee must be a team member" },
        { status: 400 }
      );
    }

    // Update task assignee
    task.assignee = assigneeId;
    task.assignedBy = session.user.id;
    await task.save();

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error assigning task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 