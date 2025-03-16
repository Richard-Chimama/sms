import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find the fee payment
    const feePayment = await prisma.feePayment.findUnique({
      where: { id: params.id },
    });

    if (!feePayment) {
      return new NextResponse('Fee payment not found', { status: 404 });
    }

    // Update the fee payment status to PAID
    const updatedFeePayment = await prisma.feePayment.update({
      where: { id: params.id },
      data: {
        status: 'PAID',
        paidDate: new Date(),
      },
    });

    return NextResponse.json(updatedFeePayment);
  } catch (error) {
    console.error('[FEES_PAY_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

