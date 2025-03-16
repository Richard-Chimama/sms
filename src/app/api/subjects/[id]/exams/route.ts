import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ExamType } from '@prisma/client';

const createExamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.nativeEnum(ExamType),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
}).refine((data) => {
  return data.endDate > data.startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
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

    // Get teacher's subject
    const subject = await prisma.subject.findUnique({
      where: {
        id: params.id,
      },
      include: {
        teacher: true,
      },
    });

    if (!subject) {
      return new NextResponse('Subject not found', { status: 404 });
    }

    // Check if the user is the teacher of this subject
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: session.user.id,
        subjects: {
          some: {
            id: subject.id
          }
        }
      }
    });

    if (!teacher) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all exams for this subject
    const exams = await prisma.exam.findMany({
      where: {
        subjectId: params.id,
      },
      include: {
        _count: {
          select: {
            questions: true,
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
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
    const session = await getServerSession(authOptions) as Session;
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get teacher's subject
    const subject = await prisma.subject.findUnique({
      where: {
        id: params.id,
      },
      include: {
        teacher: true,
      },
    });

    if (!subject) {
      return new NextResponse('Subject not found', { status: 404 });
    }

    // Check if the user is the teacher of this subject
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: session.user.id,
        subjects: {
          some: {
            id: subject.id
          }
        }
      }
    });

    if (!teacher) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedFields = createExamSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(validatedFields.error.format(), { status: 400 });
    }

    const { title, description, type, startDate, endDate } = validatedFields.data;

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        type,
        startDate,
        endDate,
        subjectId: params.id,
      },
      include: {
        _count: {
          select: {
            questions: true,
            submissions: true,
          },
        },
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error('[EXAMS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 