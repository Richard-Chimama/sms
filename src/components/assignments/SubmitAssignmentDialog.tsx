'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Assignment, Subject, AssignmentSubmission } from '@prisma/client';

interface SubmitAssignmentDialogProps {
  assignment: Assignment & {
    subject: Subject;
    submission: AssignmentSubmission | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function SubmitAssignmentDialog({
  assignment,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: SubmitAssignmentDialogProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      onError('Please provide your answer before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assignments/${assignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitted = assignment.submission?.status === 'SUBMITTED';
  const isGraded = assignment.submission?.status === 'GRADED';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
          <DialogDescription>
            {assignment.subject.name} • Due: {format(new Date(assignment.dueDate), 'PPP')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              {assignment.description || 'No description provided'}
            </p>
          </div>

          {isSubmitted && (
            <div>
              <h4 className="text-sm font-medium mb-2">Your Submission</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {assignment.submission?.content}
              </p>
            </div>
          )}

          {!isSubmitted && (
            <div>
              <h4 className="text-sm font-medium mb-2">Your Answer</h4>
              <Textarea
                placeholder="Write your answer here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          )}

          {isGraded && (
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium">Grade</h4>
                <p className="text-sm text-muted-foreground">
                  {assignment.submission?.grade}
                </p>
              </div>
              {assignment.submission?.feedback && (
                <div>
                  <h4 className="text-sm font-medium">Feedback</h4>
                  <p className="text-sm text-muted-foreground">
                    {assignment.submission.feedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Close
          </Button>
          {!isSubmitted && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 