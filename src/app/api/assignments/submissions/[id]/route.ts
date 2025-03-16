import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import { Session } from 'next-auth';

const gradeSubmissionSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional(),
  status: z.enum(['GRADED']),
});

export async function PATCH(
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

    const body = await request.json();
    const validatedData = gradeSubmissionSchema.parse(body);

    // Get the submission with assignment and subject details
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: params.id },
      include: {
        assignment: {
          include: {
            subject: {
              include: {
                teacher: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return new NextResponse('Submission not found', { status: 404 });
    }

    // Verify that the teacher has access to this submission
    if (submission.assignment.subject.teacher.user.id !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Update the submission with grade and feedback
    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: params.id },
      data: {
        grade: validatedData.grade,
        feedback: validatedData.feedback,
        status: validatedData.status,
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error('Error grading submission:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 