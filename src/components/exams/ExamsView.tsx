'use client';

import { useState, useEffect } from 'react';
import { Exam, Question, Subject, ExamType } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, FileText, CheckCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CreateExam from './CreateExam';
import AddQuestion from './AddQuestion';
import { useRouter } from 'next/navigation';

type ExamWithDetails = Exam & {
  subject: Subject;
  questions: Question[];
  _count: {
    submissions: number;
    questions: number;
  };
};

interface ExamsViewProps {
  teacherId: string;
  subject: Subject;
}

export default function ExamsView({ teacherId, subject }: ExamsViewProps) {
  const router = useRouter();
  const [exams, setExams] = useState<ExamWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  useEffect(() => {
    fetchExams();
  }, [subject.id]);

  // Function to fetch exams
  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/subjects/${subject.id}/exams`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }

      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get exam status
  const getExamStatus = (exam: ExamWithDetails) => {
    const now = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);

    if (now < startDate) {
      return { label: 'Upcoming', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    } else if (now >= startDate && now <= endDate) {
      return { label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    } else {
      return { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exams</h2>
          <p className="text-muted-foreground">
            Manage exams for {subject.name}
          </p>
        </div>
        <Button onClick={() => setIsAddingExam(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Exam
        </Button>
      </div>

      {exams.length > 0 ? (
        <div className="grid gap-4">
          {exams.map((exam) => {
            const status = getExamStatus(exam);
            
            return (
              <Card 
                key={exam.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  selectedExam === exam.id && "ring-2 ring-primary"
                )}
              >
                <CardHeader className="cursor-pointer" onClick={() => setSelectedExam(
                  selectedExam === exam.id ? null : exam.id
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{exam.title}</CardTitle>
                      <CardDescription>
                        {format(new Date(exam.startDate), "PPP")} - {format(new Date(exam.endDate), "PPP")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                      <Badge variant="secondary">
                        {exam.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {exam.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {exam.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">
                          Questions: {exam._count.questions}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Submissions: {exam._count.submissions}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExam(exam.id);
                          setIsAddingQuestion(true);
                        }}
                      >
                        Add Questions
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/teacher/exams/${exam.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No exams found</h3>
              <p className="text-sm text-muted-foreground">
                Create your first exam for this subject
              </p>
              <Button onClick={() => setIsAddingExam(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isAddingExam && (
        <CreateExam
          teacherId={teacherId}
          subjectId={subject.id}
          onClose={() => setIsAddingExam(false)}
          onSuccess={() => {
            setIsAddingExam(false);
            fetchExams();
          }}
        />
      )}

      {isAddingQuestion && selectedExam && (
        <AddQuestion
          examId={selectedExam}
          onClose={() => {
            setIsAddingQuestion(false);
          }}
          onSuccess={() => {
            setIsAddingQuestion(false);
            fetchExams();
          }}
        />
      )}
    </div>
  );
} 