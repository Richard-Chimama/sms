'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface ViewSubmissionDialogProps {
  submission: {
    id: string;
    content: string;
    status: string;
    grade: number | null;
    feedback: string | null;
    submittedAt: Date;
    student: {
      user: {
        firstName: string | null;
        lastName: string | null;
        email: string | null;
      };
    };
  };
  onClose: () => void;
  onGraded: () => void;
}

export default function ViewSubmissionDialog({
  submission,
  onClose,
  onGraded,
}: ViewSubmissionDialogProps) {
  const [grade, setGrade] = useState(submission.grade?.toString() || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/assignments/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade: parseFloat(grade),
          feedback,
          status: 'GRADED',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to grade submission');
      }

      toast.success('Submission graded successfully');
      onGraded();
      onClose();
    } catch (error) {
      toast.error('Failed to grade submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assignment Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {submission.student.user.firstName} {submission.student.user.lastName}
              </p>
              <p className="text-muted-foreground">{submission.student.user.email}</p>
            </div>
            <div className="text-right">
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
              <p className="text-sm text-muted-foreground mt-1">
                Submitted: {format(new Date(submission.submittedAt), 'PPp')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Submission Content</Label>
            <div className="rounded-lg border bg-muted p-4">
              <pre className="whitespace-pre-wrap text-sm">{submission.content}</pre>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Grade'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 