import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const dutySchema = z.object({
  type: z.enum(['MORNING_ASSEMBLY', 'BREAK_TIME', 'LIBRARY', 'SPORTS', 'LAB', 'EXAM_SUPERVISION', 'OTHER']),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = dutySchema.parse(body);

    // Convert time strings to Date objects
    const startTime = new Date(`1970-01-01T${validatedData.startTime}`);
    const endTime = new Date(`1970-01-01T${validatedData.endTime}`);

    const duty = await prisma.teacherDuty.create({
      data: {
        teacherId: params.id,
        type: validatedData.type,
        dayOfWeek: validatedData.dayOfWeek,
        startTime,
        endTime,
        location: validatedData.location,
        notes: validatedData.notes,
      },
    });

    return NextResponse.json(duty, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to create duty:', error);
    return NextResponse.json(
      { error: 'Failed to create duty' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const duties = await prisma.teacherDuty.findMany({
      where: {
        teacherId: params.id,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(duties);
  } catch (error) {
    console.error('Failed to fetch duties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch duties' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const dutyId = url.searchParams.get('dutyId');

    if (!dutyId) {
      return NextResponse.json(
        { error: 'Duty ID is required' },
        { status: 400 }
      );
    }

    await prisma.teacherDuty.delete({
      where: {
        id: dutyId,
        teacherId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete duty:', error);
    return NextResponse.json(
      { error: 'Failed to delete duty' },
      { status: 500 }
    );
  }
} 