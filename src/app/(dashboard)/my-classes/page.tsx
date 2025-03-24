import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import MyClassesView from '@/components/classes/MyClassesView';

export default async function MyClassesPage() {
  const session = await getServerSession(authOptions) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  // First get the teacher's ID
  const teacher = await prisma.teacher.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  if (!teacher) {
    redirect('/dashboard');
  }

  // Then fetch teacher's classes with related data using the teacher's ID
  const teacherWithClasses = await prisma.teacher.findUnique({
    where: {
      id: teacher.id,
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
              teacherId: teacher.id,
            },
            include: {
              class: true,
            },
          },
        },
      },
    },
  });

  if (!teacherWithClasses) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-6">
      <MyClassesView teacher={teacherWithClasses} />
    </div>
  );
} 