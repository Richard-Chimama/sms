import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const timetableSchema = z.object({
  subjectId: z.string(),
  classId: z.string(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string(),
  endTime: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = timetableSchema.parse(body);

    // Convert time strings to Date objects
    const startTime = new Date(`1970-01-01T${validatedData.startTime}`);
    const endTime = new Date(`1970-01-01T${validatedData.endTime}`);

    const timetable = await prisma.teacherTimetable.create({
      data: {
        teacherId: params.id,
        subjectId: validatedData.subjectId,
        classId: validatedData.classId,
        dayOfWeek: validatedData.dayOfWeek,
        startTime,
        endTime,
      },
      include: {
        subject: true,
        class: true,
      },
    });

    return NextResponse.json(timetable, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to create timetable:', error);
    return NextResponse.json(
      { error: 'Failed to create timetable' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const timetables = await prisma.teacherTimetable.findMany({
      where: {
        teacherId: params.id,
      },
      include: {
        subject: true,
        class: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(timetables);
  } catch (error) {
    console.error('Failed to fetch timetables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timetables' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const timetableId = url.searchParams.get('timetableId');

    if (!timetableId) {
      return NextResponse.json(
        { error: 'Timetable ID is required' },
        { status: 400 }
      );
    }

    await prisma.teacherTimetable.delete({
      where: {
        id: timetableId,
        teacherId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete timetable:', error);
    return NextResponse.json(
      { error: 'Failed to delete timetable' },
      { status: 500 }
    );
  }
} 