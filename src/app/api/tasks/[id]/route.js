import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';

// GET /api/tasks/[id]
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const task = await Task.findById(params.id)
      .populate('assignee', 'name email')
      .populate('assignedBy', 'name email')
      .populate('team', 'name')
      .populate('comments.user', 'name email');

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user has access to the task
    if (
      task.assignee.toString() !== session.user.id &&
      task.assignedBy.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id]
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const task = await Task.findById(params.id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user has access to update the task
    if (
      task.assignee.toString() !== session.user.id &&
      task.assignedBy.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status, title, description, dueDate, priority } = await req.json();

    // Update task fields
    if (status) {
      task.status = status;
      task.notifications.push({
        type: 'status_change',
        message: `Task status changed to ${status}`,
      });
    }
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) {
      task.dueDate = new Date(dueDate);
      task.notifications.push({
        type: 'due_date',
        message: `Due date updated to ${new Date(dueDate).toLocaleDateString()}`,
      });
    }
    if (priority) task.priority = priority;

    await task.save();

    const updatedTask = await Task.findById(params.id)
      .populate('assignee', 'name email')
      .populate('assignedBy', 'name email')
      .populate('team', 'name')
      .populate('comments.user', 'name email');

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/comments
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const task = await Task.findById(params.id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user has access to comment on the task
    if (
      task.assignee.toString() !== session.user.id &&
      task.assignedBy.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    task.comments.push({
      user: session.user.id,
      content,
    });

    task.notifications.push({
      type: 'comment',
      message: `New comment on task: ${task.title}`,
    });

    await task.save();

    const updatedTask = await Task.findById(params.id)
      .populate('assignee', 'name email')
      .populate('assignedBy', 'name email')
      .populate('team', 'name')
      .populate('comments.user', 'name email');

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const task = await Task.findByIdAndDelete(params.id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 