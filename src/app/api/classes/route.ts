import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const createClassSchema = z.object({
  grade: z.string().min(1),
  section: z.string().min(1),
  teacherId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createClassSchema.parse(body);

    // Check if teacher exists and is actually a teacher
    const teacher = await prisma.teacher.findUnique({
      where: { id: validatedData.teacherId },
      include: { user: true },
    });

    if (!teacher || teacher.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Invalid teacher ID' },
        { status: 400 }
      );
    }

    // Check if class with same grade and section already exists
    const existingClass = await prisma.class.findFirst({
      where: {
        grade: validatedData.grade,
        section: validatedData.section,
      },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: 'Class with this grade and section already exists' },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        grade: validatedData.grade,
        section: validatedData.section,
        teacherId: validatedData.teacherId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const classes = await prisma.class.findMany({
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        subjects: true,
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' },
      ],
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 