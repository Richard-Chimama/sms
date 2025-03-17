import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import { NoticeCategory, NotificationType } from '@prisma/client';
import { Session } from 'next-auth';
import { pusherServer } from '@/lib/pusher';

const roleToCategory = {
  ADMIN: NoticeCategory.GENERAL,
  STUDENT: NoticeCategory.STUDENT,
  TEACHER: NoticeCategory.TEACHER,
  PARENT: NoticeCategory.PARENT,
} as const;

const createNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.nativeEnum(NoticeCategory),
  pinned: z.boolean().default(false),
  expiresAt: z.string().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createNoticeSchema.parse(body);

    // Create the notice
    const notice = await prisma.notice.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        category: validatedData.category,
        pinned: session.user.role === 'ADMIN' ? validatedData.pinned : false,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        author: {
          connect: {
            id: session.user.id
          }
        }
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get all users except the notice author
    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        role: validatedData.category === NoticeCategory.GENERAL
          ? undefined // Send to all users if GENERAL
          : validatedData.category === NoticeCategory.STUDENT
          ? 'STUDENT'
          : validatedData.category === NoticeCategory.TEACHER
          ? 'TEACHER'
          : validatedData.category === NoticeCategory.PARENT
          ? 'PARENT'
          : undefined,
      },
      select: {
        id: true,
      },
    });

    // Create notifications for all relevant users
    await prisma.$transaction(
      users.map((user) =>
        prisma.notification.create({
          data: {
            type: NotificationType.NOTICE,
            title: `New Notice: ${notice.title}`,
            content: notice.content.slice(0, 100) + (notice.content.length > 100 ? '...' : ''),
            userId: user.id,
            senderId: session.user.id,
            link: `/notices?highlight=${notice.id}`,
          },
        })
      )
    );

    // Trigger Pusher events for real-time notifications
    for (const user of users) {
      await pusherServer.trigger(`private-user-${user.id}`, 'notification', {
        type: NotificationType.NOTICE,
        title: `New Notice: ${notice.title}`,
        content: notice.content.slice(0, 100) + (notice.content.length > 100 ? '...' : ''),
        link: `/notices?highlight=${notice.id}`,
      });
    }

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('[NOTICES_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create notice' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get('category');
    const category = categoryParam ? (NoticeCategory[categoryParam as keyof typeof NoticeCategory] || null) : null;
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
          ...(category ? [{ category }] : []),
        ],
        ...(searchParams.get('active') === 'true' ? {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        } : {}),
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(notices);
  } catch (error) {
    console.error('Failed to fetch notices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    );
  }
} 