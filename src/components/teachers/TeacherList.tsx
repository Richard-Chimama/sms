'use client';

import { useState } from 'react';
import Link from 'next/link';

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

interface Teacher {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  classes: Class[];
}

interface TeacherListProps {
  teachers: Teacher[];
}

export default function TeacherList({ teachers }: TeacherListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      teacher.user.firstName.toLowerCase().includes(searchLower) ||
      teacher.user.lastName.toLowerCase().includes(searchLower) ||
      teacher.user.email.toLowerCase().includes(searchLower)
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teacher.user.firstName} {teacher.user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teacher.user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.map((cls) => (
                        <span
                          key={cls.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          Grade {cls.grade}-{cls.section}
                        </span>
                      ))}
                      {teacher.classes.length === 0 && (
                        <span className="text-gray-500 text-sm">
                          No classes assigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <Link
                        href={`/teachers/${teacher.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/teachers/${teacher.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 