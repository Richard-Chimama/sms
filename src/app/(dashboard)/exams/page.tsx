import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ExamsView from '@/components/exams/ExamsView';
import { redirect } from 'next/navigation';

export default async function ExamsPage() {
  const session = await getServerSession(authOptions) as Session;
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get teacher's subjects
  const teacher = await prisma.teacher.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      subjects: {
        include: {
          exams: {
            include: {
              _count: {
                select: {
                  questions: true,
                  submissions: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    redirect('/dashboard');
  }

  return (
    <div className="container py-6">
      <ExamsView subjects={teacher.subjects} />
    </div>
  );
} 