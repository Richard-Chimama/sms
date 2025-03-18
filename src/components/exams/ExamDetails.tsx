'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Exam, Question, QuestionType } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import AddQuestion from './AddQuestion';
import EditQuestion from './EditQuestion';

interface ExamWithDetails extends Exam {
  subject: {
    id: string;
    name: string;
  };
  questions: Question[];
  duration: number;
  totalMarks: number;
}

interface ExamDetailsProps {
  exam: ExamWithDetails;
}

export function ExamDetails({ exam }: ExamDetailsProps) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>(exam.questions);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/exams/${exam.id}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      toast.error('Failed to fetch questions');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/exams/${exam.id}/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete question');
      
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const formatQuestionType = (type: QuestionType) => {
    return type.toLowerCase().replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{exam.title}</CardTitle>
          <CardDescription>{exam.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Subject</p>
              <p className="text-sm text-muted-foreground">{exam.subject.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date Range</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(exam.startDate), 'PPP')} - {format(new Date(exam.endDate), 'PPP')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm text-muted-foreground">{exam.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Marks</p>
              <p className="text-sm text-muted-foreground">{exam.totalMarks}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Questions</h3>
        <Button onClick={() => setIsAddingQuestion(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-muted-foreground">No questions added yet.</p>
            <p className="text-sm text-muted-foreground">Click the button above to add your first question.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium">{question.text}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatQuestionType(question.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.marks}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedQuestion(question);
                          setIsEditingQuestion(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {isAddingQuestion && (
        <AddQuestion
          examId={exam.id}
          onClose={() => setIsAddingQuestion(false)}
          onSuccess={() => {
            setIsAddingQuestion(false);
            fetchQuestions();
          }}
        />
      )}

      {isEditingQuestion && selectedQuestion && (
        <EditQuestion
          examId={exam.id}
          question={selectedQuestion}
          onClose={() => {
            setIsEditingQuestion(false);
            setSelectedQuestion(null);
          }}
          onSuccess={() => {
            setIsEditingQuestion(false);
            setSelectedQuestion(null);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
} 