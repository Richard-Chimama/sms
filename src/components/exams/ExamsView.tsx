'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Subject, Exam } from '@prisma/client';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { AddExam } from './AddExam';

type SubjectWithExams = Subject & {
  exams: (Exam & {
    _count: {
      questions: number;
      submissions: number;
    };
  })[];
};

interface ExamsViewProps {
  subjects: SubjectWithExams[];
}

export default function ExamsView({ subjects }: ExamsViewProps) {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || '');
  const [isAddingExam, setIsAddingExam] = useState(false);

  const currentSubject = subjects.find((subject) => subject.id === selectedSubject);
  const exams = currentSubject?.exams || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-gray-100">Exams</h2>
          <p className="text-gray-400">
            Create and manage exams for your subjects.
          </p>
        </div>
        <Button onClick={() => setIsAddingExam(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Exam
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Select Subject</CardTitle>
          <CardDescription className="text-gray-400">Choose a subject to view its exams</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-100 hover:bg-gray-800 focus:ring-gray-700">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {subjects.map((subject) => (
                <SelectItem 
                  key={subject.id} 
                  value={subject.id}
                  className="text-gray-100 hover:bg-gray-700 focus:bg-gray-700 focus:text-gray-100"
                >
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {exams.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-gray-400">No exams found for this subject.</p>
            <p className="text-gray-400">Click the button above to create your first exam.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="relative">
              <CardHeader>
                <CardTitle>{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Date Range</span>
                      <Badge variant="secondary">
                        {exam.type.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(exam.startDate), 'PPP')} - {format(new Date(exam.endDate), 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">Questions</p>
                      <p className="text-muted-foreground">{exam._count.questions}</p>
                    </div>
                    <div>
                      <p className="font-medium">Submissions</p>
                      <p className="text-muted-foreground">{exam._count.submissions}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/exams/${exam.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isAddingExam && currentSubject && (
        <AddExam
          subject={currentSubject}
          onClose={() => setIsAddingExam(false)}
          onSuccess={() => {
            setIsAddingExam(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
} 