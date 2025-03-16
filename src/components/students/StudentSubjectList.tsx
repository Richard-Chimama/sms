'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Subject } from '@prisma/client';

interface SubjectWithTeacher extends Subject {
  teacher: {
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
    };
  };
}

interface StudentSubjectListProps {
  subjects: SubjectWithTeacher[];
}

export function StudentSubjectList({ subjects }: StudentSubjectListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {subjects.map((subject) => (
        <Card key={subject.id}>
          <CardHeader>
            <CardTitle>{subject.name}</CardTitle>
            <CardDescription>Code: {subject.code}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="font-medium">Teacher</p>
                <p className="text-sm text-muted-foreground">
                  {subject.teacher.user.firstName} {subject.teacher.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {subject.teacher.user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 