'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ExamSubmissionStatus } from '@prisma/client';

interface Exam {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  subject: {
    name: string;
  };
  submission?: {
    id: string;
    status: ExamSubmissionStatus;
    totalMarks: number | null;
    submittedAt: Date | null;
  } | null;
}

interface StudentExamListProps {
  exams: Exam[];
}

export function StudentExamList({ exams }: StudentExamListProps) {
  const router = useRouter();

  const getStatusBadge = (exam: Exam) => {
    const now = new Date();
    const start = new Date(exam.startDate);
    const end = new Date(exam.endDate);

    if (exam.submission?.status === ExamSubmissionStatus.GRADED) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-4 w-4" />
          Graded ({exam.submission.totalMarks} marks)
        </Badge>
      );
    }

    if (exam.submission?.status === ExamSubmissionStatus.SUBMITTED) {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-4 w-4" />
          Submitted
        </Badge>
      );
    }

    if (exam.submission?.status === ExamSubmissionStatus.IN_PROGRESS) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-4 w-4" />
          In Progress
        </Badge>
      );
    }

    if (now < start) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-4 w-4" />
          Upcoming
        </Badge>
      );
    }

    if (now > end) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-4 w-4" />
          Expired
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="gap-1 bg-green-500">
        <Clock className="h-4 w-4" />
        Available
      </Badge>
    );
  };

  const handleStartExam = (examId: string) => {
    router.push(`/exams/${examId}`);
  };

  const canStartExam = (exam: Exam) => {
    const now = new Date();
    const start = new Date(exam.startDate);
    const end = new Date(exam.endDate);

    return (
      now >= start &&
      now <= end &&
      exam.submission?.status !== ExamSubmissionStatus.SUBMITTED &&
      exam.submission?.status !== ExamSubmissionStatus.GRADED
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <Card key={exam.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{exam.title}</span>
              {getStatusBadge(exam)}
            </CardTitle>
            <CardDescription>{exam.subject.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {exam.description || 'No description provided'}
              </p>
              <div className="text-sm">
                <p>Start: {format(new Date(exam.startDate), 'PPp')}</p>
                <p>End: {format(new Date(exam.endDate), 'PPp')}</p>
              </div>
              {exam.submission?.status === ExamSubmissionStatus.GRADED && (
                <p className="text-sm font-medium">
                  Score: {exam.submission.totalMarks}
                </p>
              )}
              {canStartExam(exam) && (
                <Button
                  className="w-full mt-4"
                  onClick={() => handleStartExam(exam.id)}
                >
                  {exam.submission?.status === ExamSubmissionStatus.IN_PROGRESS
                    ? 'Continue Exam'
                    : 'Start Exam'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 