import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { Session } from 'next-auth';
import { StudentExamList } from '@/components/students/StudentExamList';

export default async function StudentExamsPage() {
  const session = await getServerSession(authOptions) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  // Get student's details including their exams
  const student = await prisma.student.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      class: {
        include: {
          subjects: {
            include: {
              exams: {
                include: {
                  submissions: {
                    where: {
                      studentId: session.user.id,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    redirect('/dashboard');
  }

  // Flatten exams from all subjects
  const flattenedExams = student.class.subjects.flatMap((subject) =>
    subject.exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      startDate: exam.startDate,
      endDate: exam.endDate,
      subject: {
        name: subject.name,
      },
      submission: exam.submissions[0] || null,
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Exams</h1>
        <p className="text-muted-foreground">
          View and take your exams
        </p>
      </div>

      <StudentExamList exams={flattenedExams} />
    </div>
  );
} 