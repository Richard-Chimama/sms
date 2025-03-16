import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { QuestionType } from '@prisma/client';

const createQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.nativeEnum(QuestionType),
  options: z.array(z.string()).optional(),
  answer: z.string().min(1, 'Answer is required'),
  marks: z.coerce.number().min(1, 'Marks must be at least 1'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        subject: true,
      },
    });

    if (!exam) {
      return new NextResponse('Exam not found', { status: 404 });
    }

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

    if (!teacher) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const questions = await prisma.question.findMany({
      where: {
        examId: params.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('[QUESTIONS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        subject: true,
      },
    });

    if (!exam) {
      return new NextResponse('Exam not found', { status: 404 });
    }

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

    if (!teacher) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedFields = createQuestionSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(validatedFields.error.format(), { status: 400 });
    }

    const { text, type, options, answer, marks } = validatedFields.data;

    const question = await prisma.question.create({
      data: {
        text,
        type,
        options,
        answer,
        marks,
        examId: params.id,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('[QUESTIONS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 