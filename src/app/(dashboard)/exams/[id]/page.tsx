import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ExamDetails } from '@/components/exams/ExamDetails';

interface ExamPageProps {
  params: {
    id: string;
  };
}

export default async function ExamPage({ params }: ExamPageProps) {
  const session = await getServerSession(authOptions) as Session;
  if (!session?.user) return notFound();

  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: {
      subject: true,
      questions: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!exam) return notFound();

  // Check if the user is the teacher of the subject
  const teacher = await prisma.teacher.findFirst({
    where: {
      userId: session.user.id,
      subjects: {
        some: {
          id: exam.subjectId
        }
      }
    }
  });

  if (!teacher) return notFound();

  return (
    <div className="container py-6">
      <ExamDetails exam={exam} />
    </div>
  );
} 