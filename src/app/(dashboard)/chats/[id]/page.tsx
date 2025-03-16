import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ChatInterface } from '@/components/chat/ChatInterface';
import type { Session } from 'next-auth';

export default async function ChatPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions) as Session;
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const chat = await prisma.chat.findUnique({
    where: { id: params.id },
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
      messages: {
        orderBy: {
          createdAt: 'asc',
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
      },
    },
  });

  if (!chat) {
    redirect('/chats');
  }

  const isParticipant = chat.participants.some(
    (p) => p.user.id === session.user.id
  );
  if (!isParticipant) {
    redirect('/chats');
  }

  return (
    <div className="container py-6 h-[calc(100vh-4rem)]">
      <ChatInterface chat={chat} currentUserId={session.user.id} />
    </div>
  );
} 