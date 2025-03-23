'use client';

import { Teacher, TeacherTimetable, TeacherDuty, Subject, Class, DayOfWeek, DutyType } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import AddTimetableEntry from './AddTimetableEntry';
import AddDutyAssignment from './AddDutyAssignment';
import { Session } from 'next-auth';

interface CustomSession extends Session {
  user: {
    id: string;
    role: string;
  } & Session['user'];
}

type TeacherWithRelations = Teacher & {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    image: string | null;
  };
  subjects: (Subject & { class: Class })[];
  classes: Class[];
  timetables: (TeacherTimetable & {
    subject: Subject;
    class: Class;
  })[];
  duties: TeacherDuty[];
};

interface TeacherProfileProps {
  teacher: TeacherWithRelations;
}

interface AddTimetableEntryProps {
  id: string;
  subjects: (Subject & { class: Class })[];
  classes: Class[];
}

interface AddDutyAssignmentProps {
  id: string;
}

export default function TeacherProfile({ teacher }: TeacherProfileProps) {
  const { data: session } = useSession() as { data: CustomSession | null };
  const isAdmin = session?.user?.role === 'ADMIN';
  const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`;
  const initials = `${teacher.user.firstName?.[0] || ''}${teacher.user.lastName?.[0] || ''}`;

  return (
    <div className="space-y-6">
      {/* Teacher Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={teacher.user.image || ''} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{fullName}</CardTitle>
            <p className="text-sm text-gray-300">Employee ID: {teacher.employeeId}</p>
            <p className="text-sm text-gray-300">{teacher.user.email}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="duties">Duties</TabsTrigger>
          <TabsTrigger value="classes">Classes & Subjects</TabsTrigger>
        </TabsList>

        {/* Timetable Tab */}
        <TabsContent value="timetable">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Weekly Timetable</CardTitle>
              {isAdmin && (
                <AddTimetableEntry
                  id={teacher.id}
                  subjects={teacher.subjects}
                  classes={teacher.classes}
                />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacher.timetables.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-100">{slot.dayOfWeek}</p>
                      <p className="text-sm text-gray-300">
                        {format(new Date(slot.startTime), 'hh:mm a')} -{' '}
                        {format(new Date(slot.endTime), 'hh:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-100">{slot.subject.name}</p>
                      <p className="text-sm text-gray-300">
                        Class {slot.class.grade}-{slot.class.section}
                      </p>
                    </div>
                  </div>
                ))}
                {teacher.timetables.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No timetable entries found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Duties Tab */}
        <TabsContent value="duties">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assigned Duties</CardTitle>
              {isAdmin && <AddDutyAssignment id={teacher.id} />}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacher.duties.map((duty) => (
                  <div
                    key={duty.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-100">{format(duty.date, 'EEEE')}</p>
                      <p className="text-sm text-gray-300">
                        {format(new Date(duty.startTime), 'hh:mm a')} -{' '}
                        {format(new Date(duty.endTime), 'hh:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{duty.type}</Badge>
                      {duty.notes && (
                        <p className="text-sm text-gray-300">{duty.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
                {teacher.duties.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No duties assigned.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes & Subjects Tab */}
        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Classes & Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-100 mb-3">Class Teacher</h3>
                  <div className="space-y-2">
                    {teacher.classes.map((class_) => (
                      <div
                        key={class_.id}
                        className="p-3 bg-gray-800 rounded-lg"
                      >
                        <p className="font-medium text-gray-100">
                          Class {class_.grade}-{class_.section}
                        </p>
                      </div>
                    ))}
                    {teacher.classes.length === 0 && (
                      <p className="text-gray-400">Not assigned as class teacher.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-100 mb-3">Teaching Subjects</h3>
                  <div className="space-y-2">
                    {teacher.subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="p-3 bg-gray-800 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-100">{subject.name}</p>
                          <p className="text-sm text-gray-300">Code: {subject.code}</p>
                        </div>
                        <Badge variant="outline" className='text-white'>
                          Class {subject.class.grade}-{subject.class.section}
                        </Badge>
                      </div>
                    ))}
                    {teacher.subjects.length === 0 && (
                      <p className="text-gray-400">No subjects assigned.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 