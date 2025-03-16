'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { StudentWithRelations } from '@/types';

interface DeleteStudentButtonProps {
  student: StudentWithRelations;
}

export default function DeleteStudentButton({ student }: DeleteStudentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete student');
      }

      router.push('/students');
      router.refresh();
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete student');
      setIsModalOpen(true); // Keep modal open on error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Delete Student
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Student</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete the following student?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">
                  {student.user.firstName} {student.user.lastName}
                </p>
                <p className="text-gray-600">Roll Number: {student.rollNumber}</p>
                <p className="text-gray-600">Email: {student.user.email}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium">This action will:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Delete the student&apos;s profile</li>
                  <li>Remove all associated records (attendance, exam results, etc.)</li>
                  <li>Delete the parent&apos;s account</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 