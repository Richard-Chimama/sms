import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import ClassList from '@/components/classes/ClassList';
import CreateClassButton from '@/components/classes/CreateClassButton';

export default async function ClassesPage() {
  const session = await getServerSession(authOptions) as Session;

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const classesData = await prisma.class.findMany({
    include: {
      teacher: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      subjects: true,
    },
    orderBy: [
      { grade: 'asc' },
      { section: 'asc' },
    ],
  });

  // Transform the data to ensure non-null values for firstName and lastName
  const classes = classesData.map(class_ => ({
    ...class_,
    teacher: {
      ...class_.teacher,
      user: {
        firstName: class_.teacher.user.firstName || 'Unknown',
        lastName: class_.teacher.user.lastName || 'Unknown',
      },
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <CreateClassButton />
      </div>

      <ClassList classes={classes} />
    </div>
  );
} 