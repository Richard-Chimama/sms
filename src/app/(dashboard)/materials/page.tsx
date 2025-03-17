import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MaterialsList from '@/components/materials/MaterialsList';
import { Session } from 'next-auth';

export default async function MaterialsPage() {
  const session = (await getServerSession(authOptions)) as Session & {
    user: { id: string };
  };

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get user role and related info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      student: {
        include: {
          class: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  if (user.role === 'TEACHER') {
    redirect('/teacher/materials');
  }

  if (!user.student) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Class Materials</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade {user.student.class.grade}-{user.student.class.section} Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <MaterialsList classId={user.student.classId} />
        </CardContent>
      </Card>
    </div>
  );
} 