'use client';

import { useState, useEffect } from 'react';
import StudentProfile from '@/components/students/StudentProfile';
import EditStudentButton from '@/components/students/EditStudentButton';
import DeleteStudentButton from '@/components/students/DeleteStudentButton';
import type { StudentWithRelations } from '@/types';

interface StudentPageProps {
  params: {
    id: string;
  };
}

export default function StudentPage({ params }: StudentPageProps) {
  const [error, setError] = useState('');
  const [student, setStudent] = useState<StudentWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/students/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch student');
        }
        const data = await response.json();
        setStudent(data);
      } catch (error) {
        console.error('Error fetching student:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch student');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Student not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <div className="space-x-4">
          <EditStudentButton student={student} />
          <DeleteStudentButton student={student} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <StudentProfile student={student} />
    </div>
  );
} 