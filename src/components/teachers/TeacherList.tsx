'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Teacher } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Subject {
  id: string;
  name: string;
}

interface Class {
  id: string;
  grade: string;
  section: string;
  subjects: Subject[];
}

type TeacherWithUser = Teacher & {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    image: string | null;
  };
};

interface TeacherListProps {
  teachers: TeacherWithUser[];
}

export default function TeacherList({ teachers }: TeacherListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      teacher.user.firstName?.toLowerCase().includes(searchLower) ||
      teacher.user.lastName?.toLowerCase().includes(searchLower) ||
      teacher.user.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search teachers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No teachers found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => {
            const firstName = teacher.user.firstName ?? '';
            const lastName = teacher.user.lastName ?? '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed Teacher';
            const initials = `${firstName[0] || ''}${lastName[0] || ''}`.trim() || '??';

            return (
              <Link key={teacher.id} href={`/teachers/${teacher.id}`}>
                <Card className="hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={teacher.user.image ?? ''} alt={fullName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-100 truncate">
                        {fullName}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {teacher.user.email ?? 'No email provided'}
                      </p>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          ID: {teacher.employeeId}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
} 