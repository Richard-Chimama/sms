import type { Student, User, Class, Teacher, Parent, Attendance, ExamResult, Assignment, Subject } from '@prisma/client';

export type StudentWithRelations = Student & {
  user: User;
  class: Class & {
    teacher: Teacher & {
      user: User;
    };
  };
  parent: Parent & {
    user: User;
  };
  attendances: Attendance[];
  examResults: (ExamResult & {
    subject: Subject;
  })[];
  assignments: (Assignment & {
    subject: Subject;
  })[];
};

export type ClassWithTeacher = Class & {
  teacher: Teacher & {
    user: User;
  };
}; 