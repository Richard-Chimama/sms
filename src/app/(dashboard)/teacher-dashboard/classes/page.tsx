import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import TeacherClassesView from '@/components/teachers/TeacherClassesView';

export default async function TeacherClassesPage() {
  const session = await getServerSession(authOptions) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  // Fetch teacher's classes with related data
  const teacher = await prisma.teacher.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      classes: {
        include: {
          students: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          subjects: {
            where: {
              teacherId: session.user.id,
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-6">
      <TeacherClassesView teacher={teacher} />
    </div>
  );
} 