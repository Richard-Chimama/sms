import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  teacherId: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const validatedData = subjectSchema.parse(body);

    const classExists = await prisma.class.findUnique({
      where: { id: params.id },
    });

    if (!classExists) {
      return new NextResponse('Class not found', { status: 404 });
    }

    const subject = await prisma.subject.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        teacherId: validatedData.teacherId,
        classId: params.id,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(subject);
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

    const subjects = await prisma.subject.findMany({
      where: {
        classId: params.id,
      },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(subjects);
  } catch {
    return new NextResponse('Internal error', { status: 500 });
  }
} 