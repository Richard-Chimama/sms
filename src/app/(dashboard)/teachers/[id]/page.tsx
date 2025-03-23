import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import TeacherProfile from '@/components/teachers/TeacherProfile';
import { Session } from 'next-auth';

interface CustomSession extends Session {
  user: {
    id: string;
    role: string;
  } & Session['user'];
}

export default async function TeacherPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions) as CustomSession | null;

  if (!session?.user) {
    return notFound();
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: params.id },
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
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      },
      duties: {
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' },
        ],
      },
    },
  });

  if (!teacher) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <TeacherProfile teacher={teacher} />
    </div>
  );
} 