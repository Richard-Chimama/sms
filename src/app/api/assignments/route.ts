import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (session.user.role !== 'TEACHER') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const json = await req.json();
    const body = assignmentSchema.parse(json);

    // Verify that the teacher has access to the subject and class
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: session.user.id,
        subjects: {
          some: {
            id: body.subjectId,
            classId: body.classId,
          },
        },
      },
    });

    if (!teacher) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get all students in the class
    const students = await prisma.student.findMany({
      where: {
        classId: body.classId,
      },
      select: {
        id: true,
      },
    });

    // Create assignments for all students in the class
    const assignments = await prisma.$transaction(
      students.map((student) =>
        prisma.assignment.create({
          data: {
            title: body.title,
            description: body.description,
            dueDate: new Date(body.dueDate),
            studentId: student.id,
            subjectId: body.subjectId,
          },
        })
      )
    );

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error in POST /api/assignments:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ errors: error.errors }), {
        status: 400,
      });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (session.user.role !== 'TEACHER') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const classId = searchParams.get('classId');

    if (!subjectId || !classId) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Verify that the teacher has access to the subject and class
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: session.user.id,
        subjects: {
          some: {
            id: subjectId,
            classId: classId,
          },
        },
      },
    });

    if (!teacher) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        subjectId,
        student: {
          classId,
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error in GET /api/assignments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 