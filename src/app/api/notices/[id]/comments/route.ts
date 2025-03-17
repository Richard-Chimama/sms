import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import { Session } from 'next-auth';
import { NoticeCategory } from '@prisma/client';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = commentSchema.parse(body);

    // Check if notice exists and if the user can access it
    const notice = await prisma.notice.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        category: true,
      },
    });

    if (!notice) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this notice
    const userCategory = session.user.role === 'STUDENT' 
      ? NoticeCategory.STUDENT
      : session.user.role === 'TEACHER'
      ? NoticeCategory.TEACHER
      : session.user.role === 'PARENT'
      ? NoticeCategory.PARENT
      : NoticeCategory.GENERAL;

    const canAccess = 
      notice.category === NoticeCategory.GENERAL ||
      notice.category === userCategory ||
      session.user.role === 'ADMIN';

    if (!canAccess) {
      return NextResponse.json(
        { error: 'You do not have permission to comment on this notice' },
        { status: 403 }
      );
    }

    const comment = await prisma.noticeComment.create({
      data: {
        content: validatedData.content,
        notice: {
          connect: { id: params.id }
        },
        author: {
          connect: { id: session.user.id }
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

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('[NOTICE_COMMENTS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session;

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if notice exists and if the user can access it
    const notice = await prisma.notice.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        category: true,
      },
    });

    if (!notice) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this notice
    const userCategory = session.user.role === 'STUDENT' 
      ? NoticeCategory.STUDENT
      : session.user.role === 'TEACHER'
      ? NoticeCategory.TEACHER
      : session.user.role === 'PARENT'
      ? NoticeCategory.PARENT
      : NoticeCategory.GENERAL;

    const canAccess = 
      notice.category === NoticeCategory.GENERAL ||
      notice.category === userCategory ||
      session.user.role === 'ADMIN';

    if (!canAccess) {
      return NextResponse.json(
        { error: 'You do not have permission to view comments on this notice' },
        { status: 403 }
      );
    }

    const comments = await prisma.noticeComment.findMany({
      where: { noticeId: params.id },
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
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('[NOTICE_COMMENTS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
} 