import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import StudentProfile from '@/components/students/StudentProfile';
import type { StudentWithRelations } from '@/types';

type Props = {
  params: {
    id: string;
  };
};

export default async function StudentProfilePage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const student = await prisma.student.findUnique({
    where: { id: params.id },
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
      attendances: {
        orderBy: {
          date: 'desc',
        },
      },
      examResults: {
        include: {
          subject: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
      assignments: {
        include: {
          subject: true,
        },
        orderBy: {
          dueDate: 'desc',
        },
      },
      parent: {
        include: {
          user: true,
        },
      },
      feePayments: {
        orderBy: {
          dueDate: 'desc',
        },
      },
    },
  }) as StudentWithRelations | null;

  if (!student) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
      </div>
      <StudentProfile student={student} />
    </div>
  );
} 