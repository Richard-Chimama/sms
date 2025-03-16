'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { FileText, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { AssignmentSubmission } from '@prisma/client';

interface SubmissionWithDetails extends AssignmentSubmission {
  assignment: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date;
    subject: {
      name: string;
    };
  };
}

interface StudentAssignmentListProps {
  submissions: SubmissionWithDetails[];
}

export function StudentAssignmentList({ submissions }: StudentAssignmentListProps) {
  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{submission.assignment.title}</CardTitle>
                <CardDescription>
                  {submission.assignment.subject.name}
                </CardDescription>
              </div>
              <Badge
                variant={
                  submission.status === 'GRADED'
                    ? 'default'
                    : submission.status === 'SUBMITTED'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {submission.status === 'GRADED' && (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {submission.status === 'SUBMITTED' && (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                {submission.status === 'PENDING' && (
                  <AlertCircle className="mr-2 h-4 w-4" />
                )}
                {submission.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {submission.assignment.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {submission.assignment.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="font-medium">Due Date</p>
                <p className="text-muted-foreground">
                  {format(new Date(submission.assignment.dueDate), 'PPp')}
                </p>
              </div>
              {submission.grade && (
                <div>
                  <p className="font-medium">Grade</p>
                  <p className="text-muted-foreground">{submission.grade}</p>
                </div>
              )}
              {submission.feedback && (
                <div>
                  <p className="font-medium">Feedback</p>
                  <p className="text-muted-foreground">{submission.feedback}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <Link href={`/assignments/${submission.assignment.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 