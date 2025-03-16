import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Session } from 'next-auth';

interface ExamLayoutProps {
  children: React.ReactNode;
}

export default async function ExamLayout({ children }: ExamLayoutProps) {
  const session = await getServerSession(authOptions) as Session;

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  return <>{children}</>;
} 