'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Timer } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';
  options: string[] | null;
  marks: number;
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  subject: {
    name: string;
  };
}

interface Submission {
  id: string;
  status: 'IN_PROGRESS' | 'SUBMITTED';
  answers?: {
    questionId: string;
    answer: string;
  }[];
}

interface ExamTakingInterfaceProps {
  exam: Exam;
  submission: Submission;
  questions: Question[];
}

export function ExamTakingInterface({ exam, submission, questions }: ExamTakingInterfaceProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    submission.answers?.reduce((acc, curr) => ({
      ...acc,
      [curr.questionId]: curr.answer,
    }), {}) || {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswerChange = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleSaveProgress = async () => {
    try {
      const response = await fetch(`/api/exams/${exam.id}/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      toast.success('Progress saved successfully');
    } catch (error) {
      toast.error('Failed to save progress');
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = questions.filter(
      (q) => !answers[q.id]?.trim()
    ).length;

    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/exams/${exam.id}/submissions/${submission.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit exam');
      }

      toast.success('Exam submitted successfully');
      router.push('/my-class');
    } catch (error) {
      toast.error('Failed to submit exam');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{exam.title}</CardTitle>
              <CardDescription>
                {exam.subject.name} • Due: {format(new Date(exam.endDate), 'PPp')}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-2">
              <Timer className="h-4 w-4" />
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">
                Question {currentQuestionIndex + 1}{' '}
                <span className="text-muted-foreground">
                  ({currentQuestion.marks} marks)
                </span>
              </h3>
              <p>{currentQuestion.text}</p>

              {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={handleAnswerChange}
                >
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'SHORT_ANSWER' && (
                <Textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Write your answer here..."
                  className="min-h-[100px]"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                >
                  Next
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleSaveProgress}>
                  Save Progress
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 