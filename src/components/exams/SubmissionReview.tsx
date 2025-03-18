'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Exam, ExamSubmission, ExamSubmissionStatus, Question, QuestionType, Student, User } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SubmissionWithDetails extends ExamSubmission {
  exam: Exam & {
    subject: {
      name: string;
    };
    questions: Question[];
  };
  student: Student & {
    user: User;
  };
  answers: {
    questionId: string;
    answer: string;
  }[];
}

interface SubmissionReviewProps {
  submission: SubmissionWithDetails;
}

export function SubmissionReview({ submission }: SubmissionReviewProps) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScoreChange = (questionId: string, score: string) => {
    setScores((prev) => ({
      ...prev,
      [questionId]: Number(score),
    }));
  };

  const handleSubmit = async () => {
    // Validate all questions have scores
    const unansweredQuestions = submission.exam.questions.filter(
      (q) => !scores[q.id]
    );

    if (unansweredQuestions.length > 0) {
      toast.error('Please grade all questions before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/exam-submissions/${submission.id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scores: Object.entries(scores).map(([questionId, score]) => ({
            questionId,
            score,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to grade submission');
      }

      toast.success('Submission graded successfully');
      router.push(`/exams/${submission.examId}/submissions`);
    } catch (error) {
      toast.error('Failed to grade submission');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Student</p>
              <p className="text-sm text-muted-foreground">
                {submission.student.user.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Subject</p>
              <p className="text-sm text-muted-foreground">
                {submission.exam.subject.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Submitted At</p>
              <p className="text-sm text-muted-foreground">
                {submission.submittedAt
                  ? format(new Date(submission.submittedAt), 'PPp')
                  : 'Not submitted'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant="secondary">
                {submission.status.toLowerCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {submission.exam.questions.map((question) => {
          const answer = submission.answers.find(
            (a) => a.questionId === question.id
          );

          return (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Question {question.id}</span>
                  <span className="text-sm text-muted-foreground">
                    {question.marks} marks
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>{question.text}</p>

                  {question.type === QuestionType.MULTIPLE_CHOICE && (
                    <RadioGroup
                      value={answer?.answer || ''}
                      disabled
                    >
                      {(() => {
                        try {
                          const options = typeof question.options === 'string' 
                            ? JSON.parse(question.options)
                            : question.options;
                          return Array.isArray(options) 
                            ? options.map((option: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value={option}
                                    id={`option-${index}`}
                                  />
                                  <Label htmlFor={`option-${index}`}>{option}</Label>
                                </div>
                              ))
                            : null;
                        } catch (error) {
                          console.error('Error parsing question options:', error);
                          return <p className="text-sm text-red-500">Error loading options</p>;
                        }
                      })()}
                    </RadioGroup>
                  )}

                  {question.type === QuestionType.SHORT_ANSWER && (
                    <div className="p-4 bg-muted rounded-md">
                      <p className="text-sm">{answer?.answer || 'No answer provided'}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`score-${question.id}`}>Score:</Label>
                    <Input
                      id={`score-${question.id}`}
                      type="number"
                      min={0}
                      max={question.marks}
                      value={scores[question.id] || ''}
                      onChange={(e) => handleScoreChange(question.id, e.target.value)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      / {question.marks}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Grades'}
        </Button>
      </div>
    </div>
  );
} 