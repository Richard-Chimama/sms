import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import StudentList from '@/components/students/StudentList';
import CreateStudentButton from '@/components/students/CreateStudentButton';
import type { StudentWithRelations, ClassWithTeacher } from '@/types';

export default async function StudentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      include: {
        user: true,
        class: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    }) as Promise<StudentWithRelations[]>,
    prisma.class.findMany({
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' },
      ],
    }) as Promise<ClassWithTeacher[]>,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <CreateStudentButton classes={classes} />
      </div>

      <StudentList students={students} />
    </div>
  );
} 