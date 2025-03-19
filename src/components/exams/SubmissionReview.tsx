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
    <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <Card className="shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl sm:text-2xl">Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Student</p>
              <p className="text-sm text-muted-foreground break-words">
                {submission.student.user.name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Subject</p>
              <p className="text-sm text-muted-foreground break-words">
                {submission.exam.subject.name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Submitted At</p>
              <p className="text-sm text-muted-foreground">
                {submission.submittedAt
                  ? format(new Date(submission.submittedAt), 'PPp')
                  : 'Not submitted'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Status</p>
              <Badge variant="secondary" className="mt-1">
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
            <Card key={question.id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-base sm:text-lg">Question {question.id}</span>
                  <Badge variant="secondary" className="w-fit">
                    {question.marks} marks
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm sm:text-base">{question.text}</p>

                  {question.type === QuestionType.MULTIPLE_CHOICE && (
                    <RadioGroup
                      value={answer?.answer || ''}
                      disabled
                      className="space-y-3"
                    >
                      {(() => {
                        try {
                          const options = typeof question.options === 'string' 
                            ? JSON.parse(question.options)
                            : question.options;
                          return Array.isArray(options) 
                            ? options.map((option: string, index: number) => (
                                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md">
                                  <RadioGroupItem
                                    value={option}
                                    id={`option-${index}`}
                                  />
                                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                    {option}
                                  </Label>
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
                      <p className="text-sm whitespace-pre-wrap break-words">{answer?.answer || 'No answer provided'}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Label htmlFor={`score-${question.id}`} className="min-w-20">Score:</Label>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        id={`score-${question.id}`}
                        type="number"
                        min={0}
                        max={question.marks}
                        value={scores[question.id] || ''}
                        onChange={(e) => handleScoreChange(question.id, e.target.value)}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        / {question.marks}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end sticky bottom-4 sm:bottom-6 z-10">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full sm:w-auto shadow-lg"
          size="lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Grades'}
        </Button>
      </div>
    </div>
  );
} 