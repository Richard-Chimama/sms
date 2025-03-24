'use client';

import { Teacher, TeacherTimetable, TeacherDuty, Subject, Class, DayOfWeek } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarDays, ClipboardList, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

interface TeacherDashboardViewProps {
  teacher: TeacherWithRelations;
}

const dayMapping: Record<string, DayOfWeek> = {
  'SUNDAY': 'SUNDAY',
  'MONDAY': 'MONDAY',
  'TUESDAY': 'TUESDAY',
  'WEDNESDAY': 'WEDNESDAY',
  'THURSDAY': 'THURSDAY',
  'FRIDAY': 'FRIDAY',
  'SATURDAY': 'SATURDAY',
};

export default function TeacherDashboardView({ teacher }: TeacherDashboardViewProps) {
  const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`;
  const initials = `${teacher.user.firstName?.[0] || ''}${teacher.user.lastName?.[0] || ''}`;

  // Get today's timetable
  const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
  const today = dayMapping[currentDay] || 'MONDAY';
  
  const todaysTimetable = teacher.timetables.filter(
    (slot) => slot.dayOfWeek === today
  );

  const todaysDuties = teacher.duties.filter(
    (duty) => {
      const dutyDate = new Date(duty.date);
      const today = new Date();
      return (
        dutyDate.getFullYear() === today.getFullYear() &&
        dutyDate.getMonth() === today.getMonth() &&
        dutyDate.getDate() === today.getDate()
      );
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/my-classes">
            My Classes
          </Link>
        </Button>
      </div>

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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-300">Classes</p>
                <h3 className="text-2xl font-bold">{teacher.classes.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-300">Subjects</p>
                <h3 className="text-2xl font-bold">{teacher.subjects.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CalendarDays className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-300">Today&apos;s Classes</p>
                <h3 className="text-2xl font-bold">{todaysTimetable.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <ClipboardList className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-300">Today&apos;s Duties</p>
                <h3 className="text-2xl font-bold">{todaysDuties.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Timetable */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysTimetable.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-100">{slot.subject.name}</p>
                    <p className="text-sm text-gray-300">
                      Class {slot.class.grade}-{slot.class.section}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">
                      {format(new Date(slot.startTime), 'hh:mm a')} -{' '}
                      {format(new Date(slot.endTime), 'hh:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              {todaysTimetable.length === 0 && (
                <p className="text-gray-400 text-center py-4">No classes scheduled for today.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Duties */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Duties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysDuties.map((duty) => (
                <div
                  key={duty.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div>
                    <Badge variant="secondary">{duty.type.replace(/_/g, ' ')}</Badge>
                    {duty.notes && (
                      <p className="text-sm text-gray-300 mt-1">{duty.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">
                      {format(new Date(duty.startTime), 'hh:mm a')} -{' '}
                      {format(new Date(duty.endTime), 'hh:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              {todaysDuties.length === 0 && (
                <p className="text-gray-400 text-center py-4">No duties assigned for today.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes & Subjects Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Classes & Subjects Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {teacher.subjects.map((subject) => (
              <div
                key={subject.id}
                className="p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-100">{subject.name}</h4>
                    <p className="text-sm text-gray-300">Code: {subject.code}</p>
                  </div>
                  <Badge variant="outline">
                    Class {subject.class.grade}-{subject.class.section}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 