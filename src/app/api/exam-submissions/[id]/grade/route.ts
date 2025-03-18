import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ExamSubmissionStatus } from '@prisma/client';
import { Session } from 'next-auth';

export async function POST(
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

    const { scores } = await request.json();

    // Get the submission
    const submission = await prisma.examSubmission.findUnique({
      where: { id: params.id },
      include: {
        exam: true,
      },
    });

    if (!submission) {
      return new NextResponse('Submission not found', { status: 404 });
    }

    // Verify the teacher owns this exam
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        subjects: true,
      },
    });

    if (!teacher || !teacher.subjects.some(subject => subject.id === submission.exam.subjectId)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Calculate total marks
    const totalMarks = scores.reduce((sum: number, score: { score: number }) => sum + score.score, 0);

    // Update submission status and scores
    const updatedSubmission = await prisma.examSubmission.update({
      where: { id: params.id },
      data: {
        status: ExamSubmissionStatus.GRADED,
        totalMarks,
        answers: {
          updateMany: scores.map((score: { questionId: string; score: number }) => ({
            where: { questionId: score.questionId },
            data: { marks: score.score },
          })),
        },
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error('[EXAM_SUBMISSION_GRADE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 