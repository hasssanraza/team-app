import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';

// GET /api/notifications
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all tasks where the user is either assignee or assignedBy
    const tasks = await Task.find({
      $or: [
        { assignee: session.user.id },
        { assignedBy: session.user.id },
      ],
    });

    // Extract and flatten notifications from all tasks
    const notifications = tasks.flatMap(task => 
      task.notifications.map(notification => ({
        _id: notification._id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
        taskId: task._id,
        taskTitle: task.title,
      }))
    );

    // Sort notifications by date (newest first)
    notifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 