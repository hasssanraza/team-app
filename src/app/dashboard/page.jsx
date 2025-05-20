import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Team from '@/models/Team';
import Task from '@/models/Task';
import { authOptions } from '@/lib/auth';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { CreateTeamModal } from '@/components/modals/CreateTeamModal';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AnalyticsOverview from '@/components/dashboard/AnalyticsOverview';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  await connectDB();

  const teams = await Team.find({
    members: session.user.id,
  }).populate("members", "name email");

  if (!teams.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Welcome to Team App</h1>
        <p className="text-muted-foreground mb-4">
          You are not a member of any team yet.
        </p>
        <a
          href="/admin/teams"
          className="text-primary hover:underline"
        >
          Create or join a team
        </a>
      </div>
    );
  }

  // Serialize teams data for client components
  const serializedTeams = teams.map(team => ({
    _id: team._id.toString(),
    name: team.name,
    members: team.members.map(member => ({
      _id: member._id.toString(),
      name: member.name,
      email: member.email
    }))
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <CreateTeamModal />
          </div>
        </div>

        <AnalyticsOverview />

        <div className="grid gap-6">
          {serializedTeams.map((team) => (
            <div key={team._id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{team.name}</h2>
              </div>
              <TaskBoard 
                teamId={team._id} 
                teamMembers={team.members} 
              />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 