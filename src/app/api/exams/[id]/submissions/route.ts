import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (session.user.role !== 'TEACHER') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const examId = params.id;

    // Verify the teacher has access to this exam
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        subject: {
          include: {
            teacher: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!exam) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    if (exam.subject.teacher.user.id !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Fetch exam submissions with student details
    const submissions = await prisma.examSubmission.findMany({
      where: { examId },
      include: {
        student: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('[EXAM_SUBMISSIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 