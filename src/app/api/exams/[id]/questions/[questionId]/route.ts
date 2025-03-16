import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';
import { z } from 'zod';
import { QuestionType } from '@prisma/client';

const updateQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.nativeEnum(QuestionType),
  options: z.any().optional(), // For multiple choice questions
  answer: z.string().min(1, 'Answer is required'),
  marks: z.number().min(0, 'Marks must be at least 0'),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateQuestionSchema.parse(body);

    // Verify that the exam exists and the user is the teacher
    const exam = await prisma.exam.findUnique({
      where: {
        id: params.id,
      },
      include: {
        subject: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    // Verify that the user is the teacher of this subject
    if (!session.user?.email || exam.subject.teacher.user.email !== session.user.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update the question
    const question = await prisma.question.update({
      where: {
        id: params.questionId,
        examId: params.id,
      },
      data: {
        text: validatedData.text,
        type: validatedData.type,
        options: validatedData.options,
        answer: validatedData.answer,
        marks: validatedData.marks,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    console.error('[QUESTION_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify that the exam exists and the user is the teacher
    const exam = await prisma.exam.findUnique({
      where: {
        id: params.id,
      },
      include: {
        subject: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    // Verify that the user is the teacher of this subject
    if (!session.user?.email || exam.subject.teacher.user.email !== session.user.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete the question
    await prisma.question.delete({
      where: {
        id: params.questionId,
        examId: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[QUESTION_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 