import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Session } from 'next-auth';
import { StudentAssignmentList } from '@/components/students/StudentAssignmentList';
import { StudentSubjectList } from '@/components/students/StudentSubjectList';

export default async function MyClassPage() {
  const session = (await getServerSession(authOptions)) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  // Get student's details including their class and subjects
  const student = await prisma.student.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      class: {
        include: {
          subjects: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      // Include assignments for this student
      submissions: {
        include: {
          assignment: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: {
          assignment: {
            dueDate: 'desc',
          },
        },
      },
    },
  });

  if (!student) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Class</h1>
        <p className="text-muted-foreground">
          Class {student.class.grade}-{student.class.section}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Roll Number</CardTitle>
            <CardDescription>{student.rollNumber}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>{student.class.subjects.length} subjects</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>
              {student.submissions.length} total assignments
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>
              {student.submissions.filter(s => s.status === 'PENDING').length} assignments
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="subjects">
        <TabsList>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="mt-4">
          <StudentSubjectList subjects={student.class.subjects} />
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <StudentAssignmentList submissions={student.submissions} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 