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

    // Fetch exam with details
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
        },
        questions: true,
        _count: {
          select: {
            questions: true,
            submissions: true
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

    // Calculate total marks and passing score (40% by default)
    const totalMarks = exam.questions.reduce((sum, question) => sum + question.marks, 0);
    const passingScore = Math.ceil(totalMarks * 0.4); // 40% of total marks

    return NextResponse.json({
      ...exam,
      passingScore
    });
  } catch (error) {
    console.error('[EXAM_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 