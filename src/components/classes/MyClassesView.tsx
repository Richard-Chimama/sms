'use client';

import { Teacher, Class, Subject, Student } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { format } from 'date-fns';
import { Check, FileText, CalendarDays } from 'lucide-react';

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

interface MyClassesViewProps {
  teacher: TeacherWithClasses;
}

export default function MyClassesView({ teacher }: MyClassesViewProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'assignments'>('attendance');

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

              {/* Management Tabs */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <Button
                        variant={activeTab === 'attendance' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('attendance')}
                      >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Attendance
                      </Button>
                      <Button
                        variant={activeTab === 'assignments' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('assignments')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Assignments
                      </Button>
                    </div>
                    <Button>
                      {activeTab === 'attendance' ? 'Take Attendance' : 'Create Assignment'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeTab === 'attendance' ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Roll Number</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Updated</TableHead>
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
                            <TableCell>
                              <Badge variant="outline">
                                <Check className="w-4 h-4 mr-1 text-green-500" />
                                Present
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(), 'MMM d, yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        {class_.subjects.map((subject) => (
                          <Card key={subject.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">{subject.name}</h4>
                                  <p className="text-sm text-gray-300">Due: Tomorrow</p>
                                </div>
                                <Badge>New</Badge>
                              </div>
                              <p className="mt-2 text-sm text-gray-300">
                                Chapter 5 Exercise Problems
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 