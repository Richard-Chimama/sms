'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { User } from '@prisma/client';

type SubmissionWithStudent = {
  id: string;
  score: number;
  submittedAt: Date;
  student: {
    user: User;
    rollNumber: string;
  };
};

interface ExamSubmissionsProps {
  submissions: SubmissionWithStudent[];
  passingScore: number;
}

export function ExamSubmissions({ submissions, passingScore }: ExamSubmissionsProps) {
  const [activeTab, setActiveTab] = useState('all');

  const passedSubmissions = submissions.filter(
    (submission) => submission.score >= passingScore
  );
  const failedSubmissions = submissions.filter(
    (submission) => submission.score < passingScore
  );

  const getSubmissionList = () => {
    switch (activeTab) {
      case 'passed':
        return passedSubmissions;
      case 'failed':
        return failedSubmissions;
      default:
        return submissions;
    }
  };

  const submissionsToShow = getSubmissionList();

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100">Exam Submissions</CardTitle>
        <CardDescription className="text-gray-400">
          View all student submissions and their performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-gray-100 text-gray-400"
            >
              All ({submissions.length})
            </TabsTrigger>
            <TabsTrigger
              value="passed"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-gray-100 text-gray-400"
            >
              Passed ({passedSubmissions.length})
            </TabsTrigger>
            <TabsTrigger
              value="failed"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-gray-100 text-gray-400"
            >
              Failed ({failedSubmissions.length})
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {submissionsToShow.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No submissions found</p>
            ) : (
              submissionsToShow.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-900 border border-gray-700"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-gray-100">
                      {submission.student.user.firstName} {submission.student.user.lastName}
                    </p>
                    <p className="text-sm text-gray-400">
                      Roll Number: {submission.student.rollNumber}
                    </p>
                    <p className="text-sm text-gray-400">
                      Submitted: {format(submission.submittedAt, 'PPp')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-400">Score</p>
                      <p className="text-2xl font-bold text-gray-100">{submission.score}%</p>
                    </div>
                    <Badge
                      variant={submission.score >= passingScore ? "secondary" : "destructive"}
                      className="ml-2"
                    >
                      {submission.score >= passingScore ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 