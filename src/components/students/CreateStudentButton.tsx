'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Class, Teacher, User } from '@prisma/client';

type ClassWithTeacher = Class & {
  teacher: Teacher & {
    user: User;
  };
};

type CreateStudentButtonProps = {
  classes: ClassWithTeacher[];
};

export default function CreateStudentButton({ classes }: CreateStudentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [includeParent, setIncludeParent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      password: formData.get('password'),
      classId: formData.get('classId'),
      rollNumber: formData.get('rollNumber'),
      dateOfBirth: formData.get('dateOfBirth'),
      gender: formData.get('gender'),
      ...(includeParent && {
        parentEmail: formData.get('parentEmail'),
        parentFirstName: formData.get('parentFirstName'),
        parentLastName: formData.get('parentLastName'),
        parentPassword: formData.get('parentPassword'),
      }),
    };

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create student');
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating student:', error);
      alert(error instanceof Error ? error.message : 'Failed to create student');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Create Student
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Student</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Student Information</h3>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      required
                      minLength={6}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                      Class
                    </label>
                    <select
                      name="classId"
                      id="classId"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">Select a class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          Grade {cls.grade}-{cls.section} ({cls.teacher.user.firstName} {cls.teacher.user.lastName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      id="rollNumber"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      id="gender"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeParent"
                      checked={includeParent}
                      onChange={(e) => setIncludeParent(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeParent" className="text-sm font-medium text-gray-700">
                      Include Parent Information
                    </label>
                  </div>

                  {includeParent && (
                    <>
                      <h3 className="font-semibold text-gray-900">Parent Information</h3>
                      <div>
                        <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="parentEmail"
                          id="parentEmail"
                          required={includeParent}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="parentFirstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="parentFirstName"
                          id="parentFirstName"
                          required={includeParent}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="parentLastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="parentLastName"
                          id="parentLastName"
                          required={includeParent}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="parentPassword" className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <input
                          type="password"
                          name="parentPassword"
                          id="parentPassword"
                          minLength={6}
                          required={includeParent}
                          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 