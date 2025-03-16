'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import ViewSubmissionDialog from './ViewSubmissionDialog';

interface Submission {
  id: string;
  content: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  createdAt: Date;
  student: {
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
    };
  };
}

interface SubmissionsTableProps {
  submissions: Submission[];
}

export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {submission.student.user.firstName} {submission.student.user.lastName}
                  </p>
                  <p className="text-muted-foreground">{submission.student.user.email}</p>
                </div>
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                {format(new Date(submission.createdAt), 'PPp')}
              </TableCell>
              <TableCell>{submission.grade ?? '-'}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  View Submission
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedSubmission && (
        <ViewSubmissionDialog
          submission={{
            ...selectedSubmission,
            submittedAt: selectedSubmission.createdAt,
          }}
          onClose={() => setSelectedSubmission(null)}
          onGraded={() => {
            setSelectedSubmission(null);
            // Refresh the page to get updated data
            window.location.reload();
          }}
        />
      )}
    </>
  );
} 