import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import ClassList from '@/components/classes/ClassList';
import CreateClassButton from '@/components/classes/CreateClassButton';

export default async function ClassesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const classes = await prisma.class.findMany({
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