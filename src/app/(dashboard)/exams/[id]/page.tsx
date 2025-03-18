import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ExamDetails } from '@/components/exams/ExamDetails';
import { Session } from 'next-auth';

interface ExamPageProps {
  params: {
    id: string;
  };
}

export default async function ExamPage({ params }: ExamPageProps) {
  const session = await getServerSession(authOptions) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  // Get the exam with details
  const exam = await prisma.exam.findUnique({
    where: {
      id: params.id,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      questions: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      _count: {
        select: {
          questions: true,
          submissions: true,
        },
      },
    },
  });

  if (!exam) {
    redirect('/exams');
  }

  // Calculate total marks
  const totalMarks = exam.questions.reduce((sum, question) => sum + question.marks, 0);

  return (
    <div className="container py-6">
      <ExamDetails 
        exam={{
          ...exam,
          duration: 60, // Default duration in minutes
          totalMarks,
        }}
      />
    </div>
  );
} 