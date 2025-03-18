import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';
import { ExamSubmissionsList } from '@/components/exams/ExamSubmissionsList';

interface ExamSubmissionsPageProps {
  params: {
    id: string;
  };
}

export default async function ExamSubmissionsPage({ params }: ExamSubmissionsPageProps) {
  const session = await getServerSession(authOptions) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  // Get the exam with submissions
  const exam = await prisma.exam.findUnique({
    where: {
      id: params.id,
    },
    include: {
      subject: true,
      submissions: {
        include: {
          student: {
            include: {
              user: true,
            },
          },
          answers: true,
        },
        orderBy: {
          submittedAt: 'desc',
        },
      },
    },
  });

  if (!exam) {
    redirect('/exams');
  }

  // Verify the teacher owns this exam
  const teacher = await prisma.teacher.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      subjects: true,
    },
  });

  if (!teacher || !teacher.subjects.some(subject => subject.id === exam.subjectId)) {
    redirect('/exams');
  }

  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Exam Submissions</h1>
          <p className="text-muted-foreground">
            Review and grade submissions for {exam.title}
          </p>
        </div>

        <ExamSubmissionsList exam={exam} />
      </div>
    </div>
  );
} 