import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions) as Session;
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const notification = await prisma.notification.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return new NextResponse('Notification not found', { status: 404 });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: params.id,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    return new NextResponse('Internal error', { status: 500 });
  }
} 