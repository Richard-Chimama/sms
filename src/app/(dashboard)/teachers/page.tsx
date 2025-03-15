import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import TeacherList from '@/components/teachers/TeacherList';
import CreateTeacherButton from '@/components/teachers/CreateTeacherButton';

export default async function TeachersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const teachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      classes: {
        include: {
          subjects: true,
        },
      },
    },
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
        <CreateTeacherButton />
      </div>

      <TeacherList teachers={teachers} />
    </div>
  );
} 