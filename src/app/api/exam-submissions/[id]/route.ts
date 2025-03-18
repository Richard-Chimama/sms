import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ExamSubmissionStatus } from '@prisma/client';
import { Session } from 'next-auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { answers, isSubmitting } = await request.json();

    // Get the submission
    const submission = await prisma.examSubmission.findUnique({
      where: { id: params.id },
      include: {
        exam: true,
      },
    });

    if (!submission) {
      return new NextResponse('Submission not found', { status: 404 });
    }

    // Verify the student owns this submission
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student || submission.studentId !== student.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if exam is still available
    const now = new Date();
    const startDate = new Date(submission.exam.startDate);
    const endDate = new Date(submission.exam.endDate);

    if (now < startDate || now > endDate) {
      return new NextResponse('Exam is not available', { status: 400 });
    }

    // Update submission status and answers
    const updatedSubmission = await prisma.examSubmission.update({
      where: { id: params.id },
      data: {
        status: isSubmitting ? ExamSubmissionStatus.SUBMITTED : ExamSubmissionStatus.IN_PROGRESS,
        submittedAt: isSubmitting ? now : null,
        answers: {
          deleteMany: {}, // Remove all existing answers
          create: answers.map((answer: { questionId: string; answer: string }) => ({
            questionId: answer.questionId,
            answer: answer.answer,
          })),
        },
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error('[EXAM_SUBMISSION_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 