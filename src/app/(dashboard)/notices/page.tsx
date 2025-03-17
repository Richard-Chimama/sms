import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import NoticeList from '@/components/notices/NoticeList';
import CreateNoticeButton from '@/components/notices/CreateNoticeButton';
import { NoticeCategory, NotificationType } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Session } from 'next-auth';

const roleToCategory = {
  ADMIN: NoticeCategory.GENERAL,
  STUDENT: NoticeCategory.STUDENT,
  TEACHER: NoticeCategory.TEACHER,
  PARENT: NoticeCategory.PARENT,
} as const;

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: { highlight?: string };
}) {
  const session = (await getServerSession(authOptions)) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const userCategory = roleToCategory[session.user.role as keyof typeof roleToCategory] || NoticeCategory.GENERAL;

  // If there's a highlight parameter, mark the corresponding notification as read
  if (searchParams.highlight) {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        type: NotificationType.NOTICE,
        link: `/notices?highlight=${searchParams.highlight}`,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  const notices = await prisma.notice.findMany({
    where: {
      OR: [
        { category: NoticeCategory.GENERAL },
        { category: userCategory },
        ...(session.user.role === 'ADMIN' 
          ? [{ category: { in: [
              NoticeCategory.STUDENT,
              NoticeCategory.TEACHER,
              NoticeCategory.PARENT,
              NoticeCategory.EXAM,
              NoticeCategory.EVENT
            ] } }] 
          : []),
      ],
    },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: [
      { pinned: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">Notice Board</h1>
        {['ADMIN', 'TEACHER'].includes(session.user.role) && <CreateNoticeButton />}
      </div>

      <NoticeList notices={notices} userRole={session.user.role} />
    </div>
  );
} 