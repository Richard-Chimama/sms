import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { amount, paymentDate } = await request.json();

    if (!amount || !paymentDate) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const payment = await prisma.feePayment.update({
      where: { id: params.id },
      data: {
        amount: parseFloat(amount),
        paidDate: new Date(paymentDate),
        status: 'PAID',
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error processing payment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

