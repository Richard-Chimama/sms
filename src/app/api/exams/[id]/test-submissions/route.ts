import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';
import { ExamSubmissionStatus } from '@prisma/client';

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
            },
            class: {
              include: {
                students: {
                  include: {
                    user: true
                  }
                }
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

    const students = exam.subject.class.students;
    const submissionDate = new Date();
    submissionDate.setHours(submissionDate.getHours() - 1); // Set submission time to 1 hour ago

    // Create test submissions for each student
    const submissions = await Promise.all(
      students.map(async (student) => {
        const score = Math.floor(Math.random() * 41) + 60; // Random score between 60-100
        
        return prisma.examSubmission.create({
          data: {
            examId,
            studentId: student.id,
            status: ExamSubmissionStatus.SUBMITTED,
            startedAt: new Date(submissionDate.getTime() - 1000 * 60 * 30), // Started 30 minutes before submission
            submittedAt: submissionDate,
            totalMarks: score,
          },
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        });
      })
    );

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('[EXAM_TEST_SUBMISSIONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 