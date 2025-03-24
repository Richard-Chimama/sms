import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const assignmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subjectId: z.string().min(1),
  dueDate: z.string().transform((str) => new Date(str)),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const json = await request.json();
    const body = assignmentSchema.parse(json);

    // Get the teacher's ID
    const teacher = await prisma.teacher.findFirst({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return new NextResponse("Teacher not found", { status: 404 });
    }

    // Verify that the teacher has access to the subject
    const subject = await prisma.subject.findFirst({
      where: {
        id: body.subjectId,
        teacherId: teacher.id,
      },
    });

    if (!subject) {
      return new NextResponse("Subject not found or unauthorized", {
        status: 404,
      });
    }

    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate,
        teacherId: teacher.id,
        subjectId: body.subjectId,
      },
      include: {
        subject: {
          include: {
            class: true,
          },
        },
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const assignments = await prisma.assignment.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 