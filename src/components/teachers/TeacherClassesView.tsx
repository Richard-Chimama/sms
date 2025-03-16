'use client';

import { Teacher, Class, Subject, Student } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type StudentWithUser = Student & {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    image: string | null;
  };
};

type ClassWithDetails = Class & {
  students: StudentWithUser[];
  subjects: Subject[];
};

type TeacherWithClasses = Teacher & {
  classes: ClassWithDetails[];
};

interface TeacherClassesViewProps {
  teacher: TeacherWithClasses;
}

export default function TeacherClassesView({ teacher }: TeacherClassesViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Classes</h1>
      </div>

      <Tabs defaultValue={teacher.classes[0]?.id} className="w-full">
        <TabsList className="w-full justify-start">
          {teacher.classes.map((class_) => (
            <TabsTrigger key={class_.id} value={class_.id}>
              Class {class_.grade}-{class_.section}
            </TabsTrigger>
          ))}
        </TabsList>

        {teacher.classes.map((class_) => (
          <TabsContent key={class_.id} value={class_.id}>
            <div className="grid gap-6">
              {/* Class Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Class Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">Grade</p>
                      <p className="font-medium">{class_.grade}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">Section</p>
                      <p className="font-medium">{class_.section}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">Total Students</p>
                      <p className="font-medium">{class_.students.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subjects Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {class_.subjects.map((subject) => (
                      <Card key={subject.id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">{subject.name}</h4>
                            <Badge variant="outline">{subject.code}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Students List Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {class_.students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={student.user.image || ''}
                                alt={`${student.user.firstName} ${student.user.lastName}`}
                              />
                              <AvatarFallback>
                                {student.user.firstName?.[0]}
                                {student.user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {student.user.firstName} {student.user.lastName}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell>{student.user.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 