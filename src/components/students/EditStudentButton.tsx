'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { StudentWithRelations } from '@/types';

interface EditStudentButtonProps {
  student: StudentWithRelations;
}

export default function EditStudentButton({ student }: EditStudentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      rollNumber: formData.get('rollNumber'),
      parentFirstName: formData.get('parentFirstName'),
      parentLastName: formData.get('parentLastName'),
      parentEmail: formData.get('parentEmail'),
    };

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update student');
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating student:', error);
      setError(error instanceof Error ? error.message : 'Failed to update student');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-gray-100 px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        Edit Student
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Edit Student</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-300">Student Information</h3>
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-300"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      defaultValue={student.user.firstName || ''}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      defaultValue={student.user.lastName || ''}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      defaultValue={student.user.email || ''}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rollNumber"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Roll Number
                    </label>
                    <input
                      type="text"
                      id="rollNumber"
                      name="rollNumber"
                      defaultValue={student.rollNumber}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Parent Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-300">Parent Information</h3>
                  <div>
                    <label
                      htmlFor="parentFirstName"
                      className="block text-sm font-medium text-gray-300"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="parentFirstName"
                      name="parentFirstName"
                      defaultValue={student.parent.user.firstName || ''}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="parentLastName"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="parentLastName"
                      name="parentLastName"
                      defaultValue={student.parent.user.lastName || ''}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="parentEmail"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="parentEmail"
                      name="parentEmail"
                      defaultValue={student.parent.user.email || ''}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-gray-100 px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 