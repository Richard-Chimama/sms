import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ExamTakingInterface } from '@/components/exams/ExamTakingInterface';
import { ExamSubmissionStatus, QuestionType } from '@prisma/client';
import { Session } from 'next-auth';

interface ExamPageProps {
  params: {
    id: string;
  };
}

export default async function StudentExamPage({ params }: ExamPageProps) {
  const session = await getServerSession(authOptions) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  // Get the student
  const student = await prisma.student.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!student) {
    redirect('/dashboard');
  }

  // Get the exam with questions and existing submission
  const exam = await prisma.exam.findUnique({
    where: {
      id: params.id,
    },
    include: {
      subject: true,
      questions: {
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          text: true,
          type: true,
          options: true,
          marks: true,
        },
      },
      submissions: {
        where: {
          studentId: student.id,
        },
        take: 1,
        include: {
          answers: true,
        },
      },
    },
  });

  if (!exam) {
    redirect('/student-exams');
  }

  // Check if exam is available
  const now = new Date();
  const startDate = new Date(exam.startDate);
  const endDate = new Date(exam.endDate);

  if (now < startDate || now > endDate) {
    redirect('/student-exams');
  }

  // Get or create submission
  let submission = exam.submissions[0];
  if (!submission) {
    submission = await prisma.examSubmission.create({
      data: {
        examId: exam.id,
        studentId: student.id,
        status: ExamSubmissionStatus.IN_PROGRESS,
        startedAt: now,
      },
      include: {
        answers: true,
      },
    });
  } else if (submission.status === ExamSubmissionStatus.SUBMITTED || submission.status === ExamSubmissionStatus.GRADED) {
    redirect('/student-exams');
  }

  // Transform the data to match the ExamTakingInterface props
  const transformedSubmission = {
    id: submission.id,
    status: submission.status === ExamSubmissionStatus.IN_PROGRESS ? 'IN_PROGRESS' as const : 'SUBMITTED' as const,
    answers: submission.answers?.map(answer => ({
      questionId: answer.questionId,
      answer: answer.answer,
    })),
  };

  const transformedQuestions = exam.questions.map(question => {
    let parsedOptions = null;
    if (question.options) {
      try {
        parsedOptions = JSON.parse(question.options as string);
      } catch (error) {
        // If parsing fails, treat the options as a regular string array
        parsedOptions = question.options;
      }
    }

    return {
      id: question.id,
      text: question.text,
      type: question.type === QuestionType.MULTIPLE_CHOICE ? 'MULTIPLE_CHOICE' as const : 'SHORT_ANSWER' as const,
      options: parsedOptions,
      marks: question.marks,
    };
  });

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <ExamTakingInterface 
        exam={exam} 
        submission={transformedSubmission}
        questions={transformedQuestions}
      />
    </div>
  );
} 