import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import { Session } from 'next-auth';

const feeSchema = z.object({
  studentId: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1),
  dueDate: z.string().transform((str) => new Date(str)),
});

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    const body = feeSchema.parse(json);

    // Create the fee payment record
    const feePayment = await prisma.feePayment.create({
      data: {
        studentId: body.studentId,
        amount: body.amount,
        description: body.description,
        dueDate: body.dueDate,
        status: 'PENDING',
      },
    });

    return NextResponse.json(feePayment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    console.error('[FEES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    const where = {
      ...(studentId && { studentId }),
      ...(classId && { student: { classId } }),
    };

    const feePayments = await prisma.feePayment.findMany({
      where,
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

    return NextResponse.json(feePayments);
  } catch (error) {
    console.error('[FEES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
