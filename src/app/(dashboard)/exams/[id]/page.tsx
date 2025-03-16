'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExamSubmissions } from '@/components/exams/ExamSubmissions';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Exam, Question as PrismaQuestion, QuestionType, User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AddQuestion from '@/components/exams/AddQuestion';
import EditQuestion from '@/components/exams/EditQuestion';

interface ExamDetailsProps {
  params: {
    id: string;
  };
}

type Question = Omit<PrismaQuestion, 'options'> & {
  options: any | null;
};

type ExamWithDetails = Omit<Exam, 'questions'> & {
  _count: {
    questions: number;
    submissions: number;
  };
  questions: Question[];
  passingScore: number;
};

type SubmissionWithStudent = {
  id: string;
  score: number;
  submittedAt: Date;
  student: {
    user: User;
    rollNumber: string;
  };
};

export default function ExamDetailsPage({ params }: ExamDetailsProps) {
  const [exam, setExam] = useState<ExamWithDetails | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const fetchExamDetails = async () => {
    try {
      const [examResponse, submissionsResponse] = await Promise.all([
        fetch(`/api/exams/${params.id}`),
        fetch(`/api/exams/${params.id}/submissions`)
      ]);

      if (!examResponse.ok || !submissionsResponse.ok) {
        throw new Error('Failed to fetch exam details');
      }

      const examData = await examResponse.json();
      const submissionsData = await submissionsResponse.json();

      setExam(examData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching exam details:', error);
      toast.error('Failed to fetch exam details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/exams/${params.id}/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      toast.success('Question deleted successfully');
      fetchExamDetails();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleGenerateSubmissions = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(`/api/exams/${params.id}/test-submissions`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate test submissions');
      }

      await fetchExamDetails();
      toast.success('Test submissions generated successfully');
    } catch (error) {
      console.error('Error generating test submissions:', error);
      toast.error('Failed to generate test submissions');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchExamDetails();
  }, [params.id]);

  if (!exam) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight text-gray-100">{exam.title}</h2>
          <p className="text-gray-400">{exam.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateSubmissions}
            disabled={isGenerating}
            variant="secondary"
          >
            <Users className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Test Submissions'}
          </Button>
          <Button onClick={() => setIsAddingQuestion(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="text-gray-100">{exam.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Start Date</span>
              <span className="text-gray-100">{format(new Date(exam.startDate), 'PPp')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">End Date</span>
              <span className="text-gray-100">{format(new Date(exam.endDate), 'PPp')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Questions</span>
              <span className="text-gray-100">{exam._count.questions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Submissions</span>
              <span className="text-gray-100">{exam._count.submissions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Passing Score</span>
              <span className="text-gray-100">{exam.passingScore}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Questions</CardTitle>
          <CardDescription>Manage exam questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exam.questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium text-gray-100">{question.text}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {question.type.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.marks}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
        </CardContent>
      </Card>

      <Separator className="my-6 bg-gray-700" />

      <ExamSubmissions submissions={submissions} passingScore={exam.passingScore} />

      {isAddingQuestion && (
        <AddQuestion
          examId={params.id}
          onClose={() => setIsAddingQuestion(false)}
          onSuccess={() => {
            setIsAddingQuestion(false);
            fetchExamDetails();
          }}
        />
      )}

      {isEditingQuestion && selectedQuestion && (
        <EditQuestion
          examId={params.id}
          question={selectedQuestion}
          onClose={() => {
            setIsEditingQuestion(false);
            setSelectedQuestion(null);
          }}
          onSuccess={() => {
            setIsEditingQuestion(false);
            setSelectedQuestion(null);
            fetchExamDetails();
          }}
        />
      )}
    </div>
  );
} 