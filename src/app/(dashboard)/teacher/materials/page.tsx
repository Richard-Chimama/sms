import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddMaterialButton from '@/components/materials/AddMaterialButton';
import MaterialsList from '@/components/materials/MaterialsList';

export default async function TeacherMaterialsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Verify user is a teacher
  const teacher = await prisma.teacher.findFirst({
    where: { userId: session.user.id },
    include: {
      classes: true,
      subjects: true,
    },
  });

  if (!teacher) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Teaching Materials</h1>
        <AddMaterialButton classes={teacher.classes} subjects={teacher.subjects} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <MaterialsList teacherId={teacher.id} />
        </CardContent>
      </Card>
    </div>
  );
} 