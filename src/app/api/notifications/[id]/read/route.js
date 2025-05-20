import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';

// PUT /api/notifications/[id]/read
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

    // Find the task containing the notification
    const task = await Task.findOne({
      'notifications._id': params.id,
      $or: [
        { assignee: session.user.id },
        { assignedBy: session.user.id },
      ],
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Mark the notification as read
    const notification = task.notifications.id(params.id);
    if (notification) {
      notification.read = true;
      await task.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 