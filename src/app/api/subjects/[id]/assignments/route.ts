import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import { Session } from 'next-auth';

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().transform((str) => new Date(str)),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session || session.user.role !== 'TEACHER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const validatedData = assignmentSchema.parse(body);

    // Verify that the teacher is assigned to this subject
    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
      include: { teacher: true },
    });

    if (!subject) {
      return new NextResponse('Subject not found', { status: 404 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher || subject.teacherId !== teacher.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        dueDate: validatedData.dueDate,
        teacherId: teacher.id,
        subjectId: params.id,
      },
      include: {
        subject: {
          include: {
            class: true,
          },
        },
        submissions: {
          include: {
            student: {
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
        },
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
    });

    if (!subject) {
      return new NextResponse('Subject not found', { status: 404 });
    }

    // If teacher, get all assignments for the subject
    if (session.user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacher || subject.teacherId !== teacher.id) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const assignments = await prisma.assignment.findMany({
        where: { subjectId: params.id },
        include: {
          subject: {
            include: {
              class: true,
            },
          },
          submissions: {
            include: {
              student: {
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
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(assignments);
    }

    // If student, get assignments for the subject and include their submissions
    if (session.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });

      if (!student) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const assignments = await prisma.assignment.findMany({
        where: { subjectId: params.id },
        include: {
          subject: {
            include: {
              class: true,
            },
          },
          submissions: {
            where: { studentId: student.id },
            include: {
              student: {
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
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(assignments);
    }

    return new NextResponse('Unauthorized', { status: 401 });
  } catch (error) {
    console.error('[ASSIGNMENTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 