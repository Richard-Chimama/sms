import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import { Session } from 'next-auth';

const submitExamSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string; submissionId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const validatedData = submitExamSchema.parse(body);

    // Get the student
    const student = await prisma.student.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    // Get the submission and verify ownership
    const submission = await prisma.examSubmission.findUnique({
      where: {
        id: params.submissionId,
      },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!submission) {
      return new NextResponse('Submission not found', { status: 404 });
    }

    if (submission.studentId !== student.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (submission.status === 'SUBMITTED' || submission.status === 'GRADED') {
      return new NextResponse('Exam already submitted', { status: 400 });
    }

    // Check if exam is still open
    const now = new Date();
    const endDate = new Date(submission.exam.endDate);
    if (now > endDate) {
      return new NextResponse('Exam has ended', { status: 400 });
    }

    // Save the answers and mark as submitted
    const updatedSubmission = await prisma.examSubmission.update({
      where: {
        id: params.submissionId,
      },
      data: {
        answers: {
          deleteMany: {},
          create: validatedData.answers.map((answer) => ({
            questionId: answer.questionId,
            answer: answer.answer,
          })),
        },
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error('Error submitting exam:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 