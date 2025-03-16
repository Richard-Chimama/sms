import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import TeacherProfile from '@/components/teachers/TeacherProfile';

export default async function TeacherPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

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
          { dayOfWeek: 'asc' },
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