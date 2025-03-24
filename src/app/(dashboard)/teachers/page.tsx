import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import TeacherList from '@/components/teachers/TeacherList';
import CreateTeacherButton from '@/components/teachers/CreateTeacherButton';

export default async function TeachersPage() {
  const session = await getServerSession(authOptions) as Session;

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const teachers = await prisma.teacher.findMany({
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
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">Teachers</h1>
        <CreateTeacherButton />
      </div>

      <TeacherList teachers={teachers} />
    </div>
  );
} 