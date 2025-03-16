'use client';

import { Teacher, Class, Student, Subject, Assignment, AssignmentSubmission } from '@prisma/client';
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
import { Check, X, Clock, FileText, CalendarDays, Plus, CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import AssignmentList from '@/components/assignments/AssignmentList';
import AddAssignment from '@/components/assignments/AddAssignment';

type StudentWithUser = Student & {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    image: string | null;
  };
};

type AssignmentWithDetails = Assignment & {
  subject: {
    name: string;
    class: {
      grade: string;
      section: string;
    };
  };
  submissions: (AssignmentSubmission & {
    student: {
      user: {
        firstName: string | null;
        lastName: string | null;
      };
    };
  })[];
};

interface MyClassesViewProps {
  teacher: Teacher & {
    classes: (Class & {
      subjects: Subject[];
      students: StudentWithUser[];
    })[];
  };
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

type StudentAttendance = {
  id?: string;
  status: AttendanceStatus;
};

type AttendanceResponse = {
  id: string;
  status: AttendanceStatus;
  student: {
    id: string;
  };
};

export default function MyClassesView({ teacher }: MyClassesViewProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'assignments'>('attendance');
  const [date, setDate] = useState<Date>(new Date());
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StudentAttendance>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);

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
                <TabsTrigger 
                  key={class_.id} 
                  value={class_.id}
                  className="data-[state=active]:text-primary"
                >
                  Grade {class_.grade}-{class_.section}
                </TabsTrigger>
              ))}
            </TabsList>

            {teacher.classes.map((class_) => (
              <TabsContent key={class_.id} value={class_.id} className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Grade {class_.grade}-{class_.section}
                      </h3>
                      <p className="text-muted-foreground">
                        {class_.students.length} Students
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as 'attendance' | 'assignments')}
                        className="relative"
                      >
                        <TabsList className="w-full">
                          <TabsTrigger 
                            value="attendance"
                            className="data-[state=active]:text-primary"
                          >
                            <CalendarDays className="w-4 h-4 mr-2" />
                            Attendance
                          </TabsTrigger>
                          <TabsTrigger 
                            value="assignments"
                            className="data-[state=active]:text-primary"
                          >
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
                            <Button 
                              variant="outline" 
                              className={cn(
                                "justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(date, "PPP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-auto p-0" 
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(newDate) => {
                                if (newDate) {
                                  setDate(newDate);
                                  fetchAttendance(class_.id, newDate);
                                }
                              }}
                              initialFocus
                              className="rounded-md border"
                              classNames={{
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground",
                                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal",
                                day_range_end: "day-range-end",
                                day_outside: "day-outside"
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <Button
                          onClick={() => submitAttendance(class_.id, class_.students)}
                          disabled={isSubmitting}
                          variant="default"
                        >
                          Save Attendance
                        </Button>
                      </div>

                      <Card>
                        <CardContent className="p-0">
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
                                    <Avatar>
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
                                      <p className="text-muted-foreground">
                                        {student.user.email}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{student.rollNumber}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        attendanceMap[student.id]?.status === 'PRESENT'
                                          ? 'default'
                                          : attendanceMap[student.id]?.status === 'ABSENT'
                                          ? 'destructive'
                                          : 'secondary'
                                      }
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
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {activeTab === 'assignments' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Select
                          value={selectedSubject}
                          onValueChange={(value) => {
                            setSelectedSubject(value);
                            setAssignments([]);
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
                        {selectedSubject && (
                          <Button onClick={() => setIsAddingAssignment(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Assignment
                          </Button>
                        )}
                      </div>

                      {selectedSubject ? (
                        <>
                          <AssignmentList
                            subjectId={selectedSubject}
                            assignments={assignments}
                          />
                          {isAddingAssignment && (
                            <AddAssignment
                              teacherId={teacher.id}
                              subjectId={selectedSubject}
                              onClose={() => setIsAddingAssignment(false)}
                              onSuccess={async () => {
                                setIsAddingAssignment(false);
                                await fetchAssignments(selectedSubject);
                              }}
                            />
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
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