import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = (await getServerSession(authOptions)) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  } else {
    redirect('/dashboard');
  }
}
