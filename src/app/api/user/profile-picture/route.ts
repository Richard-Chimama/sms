import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import prisma from '@/lib/db/prisma';
import { Session } from 'next-auth';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { profilePicture } = await request.json();

    if (!profilePicture) {
      return NextResponse.json(
        { error: 'Profile picture URL is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        image: profilePicture,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile picture update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile picture' },
      { status: 500 }
    );
  }
} 