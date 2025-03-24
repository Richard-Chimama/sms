import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { Session } from 'next-auth';

// Specify that this is a dynamic route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CustomSession extends Session {
  user: {
    id: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  }
}

interface FeePayment {
  amount: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Session user role:', session.user.role);
    const stats: any = {};

    switch (session.user.role) {
      case 'ADMIN':
        try {
          // Get total students with logging
          const studentCount = await prisma.student.count();
          console.log('Total students count:', studentCount);
          
          // Get total teachers with logging
          const teacherCount = await prisma.teacher.count();
          console.log('Total teachers count:', teacherCount);
          
          // Get total classes with logging
          const classCount = await prisma.class.count();
          console.log('Total classes count:', classCount);
          
          // Get total revenue from completed payments
          const payments = await prisma.feePayment.findMany({
            where: {
              status: 'PAID'
            },
            select: {
              amount: true
            }
          });
          const totalRevenue = payments.reduce((sum: number, payment) => sum + payment.amount, 0);
          console.log('Total revenue:', totalRevenue);

          // Assign the values to stats
          stats.totalStudents = studentCount;
          stats.totalTeachers = teacherCount;
          stats.totalClasses = classCount;
          stats.totalRevenue = totalRevenue;

          // Log the final stats object
          console.log('Admin dashboard stats:', stats);
        } catch (error) {
          console.error('Error fetching admin stats:', error);
          throw error;
        }
        break;

      case 'TEACHER':
        // Get teacher's pending assignments
        const teacher = await prisma.teacher.findUnique({
          where: { userId: session.user.id },
          include: { classes: true }
        });

        if (teacher) {
          // Get pending assignments
          stats.pendingAssignments = await prisma.assignment.count({
            where: {
              teacherId: teacher.id,
              dueDate: { gt: new Date() }
            }
          });

          // Get upcoming exams
          stats.upcomingExams = await prisma.exam.count({
            where: {
              subject: {
                teacherId: teacher.id
              },
              startDate: { gt: new Date() }
            }
          });

          // Get unread messages
          stats.unreadMessages = await prisma.message.count({
            where: {
              user: {
                id: session.user.id
              }
            }
          });

          // Get unread notifications
          stats.unreadNotifications = await prisma.notification.count({
            where: {
              userId: session.user.id,
              isRead: false
            }
          });
        }
        break;

      case 'STUDENT':
        // Get student's attendance rate
        const student = await prisma.student.findUnique({
          where: { userId: session.user.id },
          include: { class: true }
        });

        if (student) {
          // Calculate attendance rate
          const totalClasses = await prisma.attendance.count({
            where: {
              studentId: student.id
            }
          });

          const attendedClasses = await prisma.attendance.count({
            where: {
              studentId: student.id,
              status: 'PRESENT'
            }
          });

          stats.attendanceRate = totalClasses > 0 
            ? (attendedClasses / totalClasses) * 100 
            : 0;

          // Calculate average performance from assignment submissions
          const submissions = await prisma.assignmentSubmission.findMany({
            where: {
              studentId: student.id,
              grade: { not: null }
            },
            select: {
              grade: true
            }
          });

          stats.averagePerformance = submissions.length > 0
            ? submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.length
            : 0;

          // Get pending assignments
          stats.pendingAssignments = await prisma.assignment.count({
            where: {
              subject: {
                classId: student.classId
              },
              dueDate: { gt: new Date() }
            }
          });

          // Get upcoming exams
          stats.upcomingExams = await prisma.exam.count({
            where: {
              subject: {
                classId: student.classId
              },
              startDate: { gt: new Date() }
            }
          });
        }
        break;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 