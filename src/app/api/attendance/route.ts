import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const createAttendanceSchema = z.object({
  studentId: z.string(),
  date: z.string(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
});

const createBulkAttendanceSchema = z.object({
  attendances: z.array(createAttendanceSchema),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');

    if (!classId || !date) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        student: {
          classId,
        },
        date: new Date(date),
      },
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
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    const attendanceSchema = z.object({
      classId: z.string().min(1),
      date: z.string().datetime(),
      records: z.array(
        z.object({
          studentId: z.string().min(1),
          status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
        })
      ),
    });

    const validatedData = attendanceSchema.parse(body);

    // Check if the user is a teacher and has access to the class
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        classes: true,
      },
    });

    if (!teacher) {
      return new NextResponse('Unauthorized - Teacher not found', { status: 401 });
    }

    const hasAccess = teacher.classes.some(
      (class_) => class_.id === validatedData.classId
    );

    if (!hasAccess) {
      return new NextResponse('Unauthorized - No access to class', {
        status: 401,
      });
    }

    // Create attendance records
    const attendanceRecords = await Promise.all(
      validatedData.records.map((record) =>
        prisma.attendance.create({
          data: {
            date: new Date(validatedData.date),
            studentId: record.studentId,
            status: record.status,
          },
        })
      )
    );

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    console.error('Error creating attendance records:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 