'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ClassTeacher {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface Subject {
  id: string;
  name: string;
}

interface Class {
  id: string;
  grade: string;
  section: string;
  teacher: ClassTeacher;
  subjects: Subject[];
}

interface ClassListProps {
  classes: Class[];
}

export default function ClassList({ classes }: ClassListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClasses = classes.filter((cls) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cls.grade.toLowerCase().includes(searchLower) ||
      cls.section.toLowerCase().includes(searchLower) ||
      `${cls.teacher.user.firstName} ${cls.teacher.user.lastName}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredClasses.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No classes found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cls.grade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cls.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cls.teacher.user.firstName} {cls.teacher.user.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {cls.subjects.map((subject) => (
                        <span
                          key={subject.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {subject.name}
                        </span>
                      ))}
                      {cls.subjects.length === 0 && (
                        <span className="text-gray-500 text-sm">
                          No subjects assigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <Link
                        href={`/classes/${cls.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/classes/${cls.id}/edit`}
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