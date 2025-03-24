import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import TeacherDashboardView from '@/components/teachers/TeacherDashboardView';
import { Prisma } from '@prisma/client';

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  // Fetch teacher data with related information
  const teacher = await prisma.teacher.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
      subjects: {
        include: {
          class: true,
        },
      },
      classes: true,
      timetables: {
        include: {
          subject: true,
          class: true,
        },
        orderBy: [
          { startTime: 'asc' },
        ],
      },
      duties: {
        orderBy: [
          { startTime: 'asc' },
        ],
      },
    },
  });

  if (!teacher) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-6">
      <TeacherDashboardView teacher={teacher} />
    </div>
  );
} 