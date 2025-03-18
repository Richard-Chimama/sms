import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';
import { SubmissionReview } from '@/components/exams/SubmissionReview';

interface SubmissionReviewPageProps {
  params: {
    id: string;
    submissionId: string;
  };
}

export default async function SubmissionReviewPage({ params }: SubmissionReviewPageProps) {
  const session = await getServerSession(authOptions) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  // Get the submission with exam and student details
  const submission = await prisma.examSubmission.findUnique({
    where: {
      id: params.submissionId,
    },
    include: {
      exam: {
        include: {
          subject: true,
          questions: true,
        },
      },
      student: {
        include: {
          user: true,
        },
      },
      answers: true,
    },
  });

  if (!submission) {
    redirect(`/exams/${params.id}/submissions`);
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

  if (!teacher || !teacher.subjects.some(subject => subject.id === submission.exam.subjectId)) {
    redirect('/exams');
  }

  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Review Submission</h1>
          <p className="text-muted-foreground">
            Grade submission for {submission.student.user.name}
          </p>
        </div>

        <SubmissionReview submission={submission} />
      </div>
    </div>
  );
} 