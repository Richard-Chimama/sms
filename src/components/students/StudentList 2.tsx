'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { StudentWithRelations } from '@/types';

type StudentListProps = {
  students: StudentWithRelations[];
};

export default function StudentList({ students }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter((student) => {
    const searchString = searchTerm.toLowerCase();
    return (
      student.user.firstName.toLowerCase().includes(searchString) ||
      student.user.lastName.toLowerCase().includes(searchString) ||
      student.rollNumber.toLowerCase().includes(searchString) ||
      student.class.grade.toLowerCase().includes(searchString) ||
      student.class.section.toLowerCase().includes(searchString) ||
      student.class.teacher.user.firstName.toLowerCase().includes(searchString) ||
      student.class.teacher.user.lastName.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/students/${student.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {student.user.firstName} {student.user.lastName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{student.rollNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.class.grade}-{student.class.section}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.class.teacher.user.firstName} {student.class.teacher.user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{student.user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-3">
                  <Link
                    href={`/students/${student.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => {/* TODO: Implement edit functionality */}}
                    className="text-green-600 hover:text-green-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 