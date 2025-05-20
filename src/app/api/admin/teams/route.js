import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Team from '@/models/Team';

// Middleware to check if user is admin
async function isAdmin(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Debug log
    if (!session) {
      console.log('No session found');
      return false;
    }
    if (session.user.role !== 'admin') {
      console.log('User is not admin:', session.user.role);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    return false;
  }
}

// GET /api/admin/teams
export async function GET(req) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const teams = await Team.find()
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/teams
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const team = await Team.create({
      name,
      description,
      leader: session.user.id,
      members: [session.user.id], // Add the leader as the first member
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 