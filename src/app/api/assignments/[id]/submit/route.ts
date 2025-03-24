import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { content } = await request.json();

    if (!content) {
      return new NextResponse('Content is required', { status: 400 });
    }

    // Get the student
    const student = await prisma.student.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    // Check if submission already exists
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: params.id,
          studentId: student.id,
        },
      },
    });

    if (existingSubmission) {
      return new NextResponse('Submission already exists', { status: 400 });
    }

    // Create the submission
    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId: params.id,
        studentId: student.id,
        content,
        status: 'SUBMITTED',
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 