'use client';

import { Teacher, Class, Student, Subject } from '@prisma/client';
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
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, X, Clock, FileText, CalendarDays } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import AssignmentList from '@/components/assignments/AssignmentList';

type StudentWithUser = Student & {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    image: string | null;
  };
};

type ClassWithStudents = Class & {
  students: StudentWithUser[];
  subjects: (Subject & { class: Class })[];
};

type TeacherWithClasses = Teacher & {
  classes: ClassWithStudents[];
};

interface MyClassesViewProps {
  teacher: TeacherWithClasses;
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

type StudentAttendance = {
  id: string;
  status: AttendanceStatus;
};

type AttendanceResponse = {
  id: string;
  status: AttendanceStatus;
  student: {
    id: string;
  };
};

type AssignmentWithStudent = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  subjectId: string;
  studentId: string;
  student: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
    };
  };
};

export default function MyClassesView({ teacher }: MyClassesViewProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'assignments'>('attendance');
  const [date, setDate] = useState<Date>(new Date());
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StudentAttendance>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentWithStudent[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Function to fetch existing attendance for a class on a specific date
  const fetchAttendance = async (classId: string, selectedDate: Date) => {
    try {
      const response = await fetch(
        `/api/attendance?classId=${classId}&date=${selectedDate.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const data = (await response.json()) as AttendanceResponse[];
      const newAttendanceMap: Record<string, StudentAttendance> = {};
      
      data.forEach((attendance) => {
        newAttendanceMap[attendance.student.id] = {
          id: attendance.id,
          status: attendance.status,
        };
      });

      setAttendanceMap(newAttendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance');
    }
  };

  // Function to submit attendance for a class
  const submitAttendance = async (classId: string, students: StudentWithUser[]) => {
    try {
      setIsSubmitting(true);
      
      const attendances = students.map((student) => ({
        studentId: student.id,
        date: date.toISOString(),
        status: attendanceMap[student.id]?.status || 'PRESENT',
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendances }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit attendance');
      }

      toast.success('Attendance submitted successfully');
      await fetchAttendance(classId, date);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error('Failed to submit attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to update attendance status for a student
  const updateAttendanceStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Effect to fetch assignments when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchAssignments(selectedSubject);
    }
  }, [selectedSubject]);

  // Function to fetch assignments for a subject
  const fetchAssignments = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/subjects/${subjectId}/assignments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={teacher.classes[0]?.id}>
            <TabsList className="grid grid-cols-2 lg:grid-cols-4">
              {teacher.classes.map((class_) => (
                <TabsTrigger key={class_.id} value={class_.id}>
                  Grade {class_.grade}-{class_.section}
                </TabsTrigger>
              ))}
            </TabsList>

            {teacher.classes.map((class_) => (
              <TabsContent key={class_.id} value={class_.id}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Grade {class_.grade}-{class_.section}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {class_.students.length} Students
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as 'attendance' | 'assignments')}
                      >
                        <TabsList>
                          <TabsTrigger value="attendance">
                            <CalendarDays className="w-4 h-4 mr-2" />
                            Attendance
                          </TabsTrigger>
                          <TabsTrigger value="assignments">
                            <FileText className="w-4 h-4 mr-2" />
                            Assignments
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  {activeTab === 'attendance' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline">
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {format(date, 'PPP')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(date) => {
                                if (date) {
                                  setDate(date);
                                  fetchAttendance(class_.id, date);
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Button
                          onClick={() => submitAttendance(class_.id, class_.students)}
                          disabled={isSubmitting}
                        >
                          Save Attendance
                        </Button>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Roll Number</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
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
                                  <p className="text-sm text-gray-500">
                                    {student.user.email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{student.rollNumber}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    attendanceMap[student.id]?.status === 'PRESENT' && 'bg-green-50 text-green-700 border-green-200',
                                    attendanceMap[student.id]?.status === 'ABSENT' && 'bg-red-50 text-red-700 border-red-200',
                                    attendanceMap[student.id]?.status === 'LATE' && 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  )}
                                >
                                  {attendanceMap[student.id]?.status === 'PRESENT' && (
                                    <Check className="w-4 h-4 mr-1" />
                                  )}
                                  {attendanceMap[student.id]?.status === 'ABSENT' && (
                                    <X className="w-4 h-4 mr-1" />
                                  )}
                                  {attendanceMap[student.id]?.status === 'LATE' && (
                                    <Clock className="w-4 h-4 mr-1" />
                                  )}
                                  {attendanceMap[student.id]?.status || 'PRESENT'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={attendanceMap[student.id]?.status || 'PRESENT'}
                                  onValueChange={(value: AttendanceStatus) =>
                                    updateAttendanceStatus(student.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PRESENT">Present</SelectItem>
                                    <SelectItem value="ABSENT">Absent</SelectItem>
                                    <SelectItem value="LATE">Late</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {activeTab === 'assignments' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Select
                          value={selectedSubject}
                          onValueChange={(value) => {
                            setSelectedSubject(value);
                            setAssignments([]); // Reset assignments when subject changes
                          }}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {class_.subjects
                              .filter((subject) => subject.classId === class_.id)
                              .map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedSubject ? (
                        <AssignmentList
                          subjectId={selectedSubject}
                          assignments={assignments}
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          {class_.subjects.filter((subject) => subject.classId === class_.id).length === 0 
                            ? "No subjects available for this class"
                            : "Select a subject to view assignments"
                          }
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 