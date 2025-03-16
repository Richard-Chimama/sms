import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createBulkAttendanceSchema.parse(body);

    // Get teacher's classes to verify authorization
    const teacher = await prisma.teacher.findFirst({
      where: {
        user: {
          email: session.user.email!,
        },
      },
      include: {
        classes: {
          include: {
            students: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Get all student IDs from teacher's classes
    const authorizedStudentIds = teacher.classes.flatMap(
      (class_) => class_.students.map((student) => student.id)
    );

    // Verify all students in the attendance list belong to teacher's classes
    const unauthorizedStudents = validatedData.attendances.filter(
      (attendance) => !authorizedStudentIds.includes(attendance.studentId)
    );

    if (unauthorizedStudents.length > 0) {
      return NextResponse.json(
        { error: 'Unauthorized to mark attendance for some students' },
        { status: 403 }
      );
    }

    // Create or update attendance records
    const attendances = await Promise.all(
      validatedData.attendances.map((attendance) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: attendance.studentId,
              date: new Date(attendance.date),
            },
          },
          update: {
            status: attendance.status,
          },
          create: {
            studentId: attendance.studentId,
            date: new Date(attendance.date),
            status: attendance.status,
          },
        })
      )
    );

    return NextResponse.json(attendances);
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const classId = searchParams.get('classId');

    if (!date || !classId) {
      return NextResponse.json(
        { error: 'Date and classId are required' },
        { status: 400 }
      );
    }

    // If teacher, verify they teach this class
    if (session.user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: {
          user: {
            email: session.user.email!,
          },
          classes: {
            some: {
              id: classId,
            },
          },
        },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: 'Unauthorized to view this class' },
          { status: 403 }
        );
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        student: {
          classId,
        },
        date: new Date(date),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
} 