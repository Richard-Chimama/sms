'use client';

import { useState } from 'react';
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
import { Assignment, Subject, AssignmentSubmission } from '@prisma/client';
import { SubmitAssignmentDialog } from '@/components/assignments/SubmitAssignmentDialog';
import { toast } from 'sonner';

interface AssignmentWithSubmission extends Assignment {
  subject: Subject;
  submission: AssignmentSubmission | null;
}

interface StudentAssignmentListProps {
  assignments: AssignmentWithSubmission[];
}

export function StudentAssignmentList({ assignments }: StudentAssignmentListProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithSubmission | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const handleViewAssignment = (assignment: AssignmentWithSubmission) => {
    setSelectedAssignment(assignment);
    setIsSubmitDialogOpen(true);
  };

  const handleSubmitSuccess = () => {
    toast.success('Assignment submitted successfully!');
    // Refresh the page to show updated status
    window.location.reload();
  };

  const handleSubmitError = (error: string) => {
    toast.error(error || 'Failed to submit assignment. Please try again.');
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assignments.map((assignment) => (
        <Card key={assignment.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{assignment.title}</span>
              <Badge
                variant={
                  assignment.submission?.status === 'GRADED'
                    ? 'default'
                    : assignment.submission?.status === 'SUBMITTED'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {assignment.submission?.status === 'GRADED'
                  ? 'Graded'
                  : assignment.submission?.status === 'SUBMITTED'
                  ? 'Submitted'
                  : 'Pending'}
              </Badge>
            </CardTitle>
            <CardDescription>{assignment.subject.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {assignment.description || 'No description provided'}
            </p>
            <p className="text-sm">
              Due: {format(new Date(assignment.dueDate), 'PPP')}
            </p>
            {assignment.submission?.grade !== undefined && (
              <p className="text-sm mt-2">
                Grade: {assignment.submission.grade}
              </p>
            )}
            {assignment.submission?.feedback && (
              <p className="text-sm mt-2">
                Feedback: {assignment.submission.feedback}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleViewAssignment(assignment)}
              className="flex items-center gap-2 hover:bg-secondary/80"
            >
              <Eye className="w-4 h-4" />
              <span className="font-medium">View Details</span>
            </Button>
            {!assignment.submission && (
              <Button
                size="sm"
                onClick={() => handleViewAssignment(assignment)}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium">Submit</span>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}

      {selectedAssignment && (
        <SubmitAssignmentDialog
          assignment={selectedAssignment}
          open={isSubmitDialogOpen}
          onOpenChange={setIsSubmitDialogOpen}
          onSuccess={handleSubmitSuccess}
          onError={handleSubmitError}
        />
      )}
    </div>
  );
} 