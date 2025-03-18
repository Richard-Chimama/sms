'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Exam, ExamSubmission, ExamSubmissionStatus, Question, Student, User } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ExamWithDetails extends Exam {
  subject: {
    name: string;
  };
  submissions: (ExamSubmission & {
    student: Student & {
      user: User;
    };
    answers: {
      questionId: string;
      answer: string;
    }[];
  })[];
}

interface ExamSubmissionsListProps {
  exam: ExamWithDetails;
}

export function ExamSubmissionsList({ exam }: ExamSubmissionsListProps) {
  const router = useRouter();

  const getStatusBadge = (status: ExamSubmissionStatus) => {
    switch (status) {
      case ExamSubmissionStatus.GRADED:
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-4 w-4" />
            Graded
          </Badge>
        );
      case ExamSubmissionStatus.SUBMITTED:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-4 w-4" />
            Submitted
          </Badge>
        );
      case ExamSubmissionStatus.IN_PROGRESS:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-4 w-4" />
            In Progress
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleReviewSubmission = (submissionId: string) => {
    router.push(`/exams/${exam.id}/submissions/${submissionId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {exam.submissions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No submissions yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exam.submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    {submission.student.user.name}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(submission.status)}
                  </TableCell>
                  <TableCell>
                    {submission.submittedAt
                      ? format(new Date(submission.submittedAt), 'PPp')
                      : 'Not submitted'}
                  </TableCell>
                  <TableCell>
                    {submission.totalMarks || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReviewSubmission(submission.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 