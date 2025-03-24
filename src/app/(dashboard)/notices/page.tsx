import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import NoticeList from '@/components/notices/NoticeList';
import CreateNoticeButton from '@/components/notices/CreateNoticeButton';
import { NoticeCategory } from '@prisma/client';

const roleToCategory = {
  ADMIN: NoticeCategory.GENERAL,
  STUDENT: NoticeCategory.STUDENT,
  TEACHER: NoticeCategory.TEACHER,
  PARENT: NoticeCategory.PARENT,
} as const;

export default async function NoticesPage() {
  const session = await getServerSession(authOptions) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const userCategory = roleToCategory[session.user.role as keyof typeof roleToCategory] || NoticeCategory.GENERAL;

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