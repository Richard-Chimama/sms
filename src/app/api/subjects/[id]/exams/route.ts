import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ExamType } from '@prisma/client';

const createExamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.nativeEnum(ExamType),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalMarks: z.number().min(0, 'Total marks must be at least 0'),
  passingMarks: z.number().min(0, 'Passing marks must be at least 0'),
  duration: z.number().min(0, 'Duration must be at least 0'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const exams = await prisma.exam.findMany({
      where: {
        subjectId: params.id,
      },
      include: {
        subject: true,
        questions: true,
        _count: {
          select: {
            submissions: true,
            questions: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error('[EXAMS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = createExamSchema.parse(body);

    // Verify that the teacher has access to this subject
    const subject = await prisma.subject.findFirst({
      where: {
        id: params.id,
        teacherId: validatedData.teacherId,
      },
    });

    if (!subject) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const exam = await prisma.exam.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        subject: {
          connect: {
            id: params.id,
          },
        },
      },
      include: {
        subject: true,
        questions: true,
        _count: {
          select: {
            submissions: true,
            questions: true,
          },
        },
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    console.error('[EXAM_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 