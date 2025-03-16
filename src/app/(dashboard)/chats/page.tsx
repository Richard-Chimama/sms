import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ChatList } from '@/components/chat/ChatList';
import type { Session } from 'next-auth';

export default async function ChatsPage() {
  const session = await getServerSession(authOptions) as Session;
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const chats = await prisma.chat.findMany({
    where: {
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
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
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
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Chats</h1>
      <ChatList chats={chats} currentUserId={session.user.id} />
    </div>
  );
}
