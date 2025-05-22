import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Team from '@/models/Team';

// POST /api/teams
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Debug log

    if (!session) {
      console.log('No session found'); // Debug log
      return NextResponse.json(
        { error: 'You must be logged in to create a team' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('Request body:', body); // Debug log

    const { name, description, members } = body;

    if (!name) {
      console.log('Missing team name'); // Debug log
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    await connectDB();
    console.log('Connected to database'); // Debug log

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      console.log('Team name already exists:', name); // Debug log
      return NextResponse.json(
        { error: 'A team with this name already exists' },
        { status: 400 }
      );
    }

    // Create array of member IDs including the team leader
    const memberIds = [session.user.id, ...(members || [])];

    const teamData = {
      name,
      description,
      leader: session.user.id,
      members: memberIds,
    };
    console.log('Creating team with data:', teamData); // Debug log

    const team = await Team.create(teamData);
    console.log('Team created successfully:', team); // Debug log

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Detailed error creating team:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Failed to create team. Please try again.' },
      { status: 500 }
    );
  }
} 