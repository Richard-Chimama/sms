import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { Session } from 'next-auth';

interface CustomSession extends Session {
  user: {
    id: string;
    role: string;
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions) as CustomSession;

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardStats />
    </div>
  );
} 