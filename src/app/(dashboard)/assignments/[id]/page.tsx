import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Session } from 'next-auth';
import { SubmissionsTable } from '@/components/assignments/SubmissionsTable';

interface AssignmentDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function AssignmentDetailsPage({ params }: AssignmentDetailsPageProps) {
  const session = (await getServerSession(authOptions)) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: {
      subject: {
        include: {
          class: true,
        },
      },
      submissions: {
        include: {
          student: {
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
  });

  if (!assignment) {
    redirect('/assignments');
  }

  const submittedCount = assignment.submissions.filter(s => s.status === 'SUBMITTED').length;
  const gradedCount = assignment.submissions.filter(s => s.status === 'GRADED').length;
  const pendingCount = assignment.submissions.filter(s => s.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <p className="text-muted-foreground">
            {assignment.subject.name} ({assignment.subject.class.grade}-
            {assignment.subject.class.section})
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download All Submissions
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Due Date</CardTitle>
            <CardDescription>
              {format(new Date(assignment.dueDate), 'PPP')}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Submissions</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {submittedCount + gradedCount} / {assignment.submissions.length}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Graded</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {gradedCount} submissions
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              {pendingCount} students
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {assignment.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{assignment.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="graded">Graded</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <SubmissionsTable submissions={assignment.submissions} />
            </TabsContent>
            <TabsContent value="submitted" className="mt-4">
              <SubmissionsTable 
                submissions={assignment.submissions.filter(s => s.status === 'SUBMITTED')} 
              />
            </TabsContent>
            <TabsContent value="graded" className="mt-4">
              <SubmissionsTable 
                submissions={assignment.submissions.filter(s => s.status === 'GRADED')} 
              />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <SubmissionsTable 
                submissions={assignment.submissions.filter(s => s.status === 'PENDING')} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 