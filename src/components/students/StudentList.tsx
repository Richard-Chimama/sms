'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Class, Student, Teacher, User } from '@prisma/client';

type StudentWithDetails = Student & {
  user: User;
  class: Class & {
    teacher: Teacher & {
      user: User;
    };
  };
  parent?: {
    user: User;
  } | null;
};

type StudentListProps = {
  students: StudentWithDetails[];
};

export default function StudentList({ students }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true;
    const searchString = searchTerm.toLowerCase();
    return (
      (student.user?.firstName || '').toLowerCase().includes(searchString) ||
      (student.user?.lastName || '').toLowerCase().includes(searchString) ||
      (student.rollNumber || '').toLowerCase().includes(searchString) ||
      (student.class?.grade?.toString() || '').toLowerCase().includes(searchString) ||
      (student.class?.section || '').toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white border-gray-700"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                  {student.user.firstName} {student.user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-100">{student.rollNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-100">{student.dateOfBirth ? new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-100">{student.gender || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                  Grade {student.class.grade}-{student.class.section}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                  {student.class.teacher.user.firstName} {student.class.teacher.user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-100">
                  {student.parent ? (
                    `${student.parent.user.firstName} ${student.parent.user.lastName}`
                  ) : (
                    <span className="text-gray-400">Not registered</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 