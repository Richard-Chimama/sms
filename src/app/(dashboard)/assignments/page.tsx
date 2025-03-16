import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import AssignmentsView from '@/components/assignments/AssignmentsView';
import { Assignment, AssignmentSubmission } from '@prisma/client';

type AssignmentWithDetails = Assignment & {
  subject: {
    name: string;
    class: {
      grade: string;
      section: string;
    };
  };
  submissions: (AssignmentSubmission & {
    student: {
      user: {
        firstName: string | null;
        lastName: string | null;
      };
    };
  })[];
};

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  // Get teacher's ID
  const teacher = await prisma.teacher.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  if (!teacher) {
    redirect('/dashboard');
  }

  // Fetch all assignments for subjects taught by this teacher
  const assignments = await prisma.assignment.findMany({
    where: {
      subject: {
        teacherId: teacher.id,
      },
    },
    include: {
      subject: {
        include: {
          class: true,
        },
      },
      submissions: {
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto py-6">
      <AssignmentsView assignments={assignments} teacherId={teacher.id} />
    </div>
  );
} 