import type { Student, User, Class, Teacher } from '@prisma/client';

export type StudentWithRelations = Student & {
  user: User;
  class: Class & {
    teacher: Teacher & {
      user: User;
    };
  };
};

export type ClassWithTeacher = Class & {
  teacher: Teacher & {
    user: User;
  };
}; 