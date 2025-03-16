import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'TEACHER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const validatedData = assignmentSchema.parse(body);

    // Verify that the teacher is assigned to this subject
    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
      include: { class: { include: { students: true } } },
    });

    if (!subject) {
      return new NextResponse('Subject not found', { status: 404 });
    }

    if (subject.teacherId !== (await prisma.teacher.findUnique({ where: { userId: session.user.id } }))?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create assignments for all students in the class
    const assignments = await prisma.$transaction(
      subject.class.students.map((student) =>
        prisma.assignment.create({
          data: {
            title: validatedData.title,
            description: validatedData.description,
            dueDate: validatedData.dueDate,
            studentId: student.id,
            subjectId: params.id,
          },
        })
      )
    );

    return NextResponse.json(assignments);
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
    const session = await getServerSession(authOptions);

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
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(assignments);
    }

    // If student, get only their assignments
    if (session.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });

      if (!student) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const assignments = await prisma.assignment.findMany({
        where: {
          subjectId: params.id,
          studentId: student.id,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(assignments);
    }

    return new NextResponse('Unauthorized', { status: 401 });
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
} 