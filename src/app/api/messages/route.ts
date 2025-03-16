import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';
import { z } from 'zod';
import type { Session } from 'next-auth';

const messageSchema = z.object({
  chatId: z.string(),
  content: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as Session;
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { chatId, content } = messageSchema.parse(body);

    // Check if user is a participant in the chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      return new NextResponse('Chat not found or unauthorized', { status: 404 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        chatId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Create notifications for other participants
    const otherParticipants = chat.participants.filter(
      (p) => p.user.id !== session.user.id
    );

    const senderName = `${session.user.firstName || ''} ${
      session.user.lastName || ''
    }`.trim();

    await Promise.all(
      otherParticipants.map((participant) =>
        prisma.notification.create({
          data: {
            type: 'MESSAGE',
            title: `New message from ${senderName || 'Unknown User'}`,
            content: content.length > 100 ? content.slice(0, 97) + '...' : content,
            userId: participant.user.id,
            senderId: session.user.id,
            link: `/chats/${chatId}`,
          },
        })
      )
    );

    // Trigger Pusher events
    await pusherServer.trigger(`chat-${chatId}`, 'new-message', message);
    
    // Send notifications to other participants
    await Promise.all(
      otherParticipants.map((participant) =>
        pusherServer.trigger(
          `user-${participant.user.id}`,
          'new-notification',
          {
            type: 'MESSAGE',
            title: `New message from ${senderName || 'Unknown User'}`,
            content: content.length > 100 ? content.slice(0, 97) + '...' : content,
            link: `/chats/${chatId}`,
          }
        )
      )
    );

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
} 