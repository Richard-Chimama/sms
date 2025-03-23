import { PrismaClient, User, Student, Teacher, Parent } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up the database...');
  
  // Delete records in the correct order to respect foreign key constraints
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.examSubmission.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.materialResource.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.teacherTimetable.deleteMany();
  await prisma.teacherDuty.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.noticeComment.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Starting to seed the database...');

  // Create admin user
  console.log('👑 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@school.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create teachers
  console.log('👨‍🏫 Creating teachers...');
  const teacher1Password = await bcrypt.hash('teacher123', 10);
  const teacher2Password = await bcrypt.hash('teacher123', 10);
  
  const teacher1User = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'john.smith@school.com',
      password: teacher1Password,
      role: 'TEACHER',
      teacher: {
        create: {
          employeeId: 'T001',
        },
      },
    },
    include: {
      teacher: true,
    },
  });

  const teacher2User = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@school.com',
      password: teacher2Password,
      role: 'TEACHER',
      teacher: {
        create: {
          employeeId: 'T002',
        },
      },
    },
    include: {
      teacher: true,
    },
  });

  // Create classes
  console.log('🏫 Creating classes...');
  const class1 = await prisma.class.create({
    data: {
      grade: '10',
      section: 'A',
      teacherId: teacher1User.teacher!.id,
    },
  });

  const class2 = await prisma.class.create({
    data: {
      grade: '10',
      section: 'B',
      teacherId: teacher2User.teacher!.id,
    },
  });

  // Create subjects
  console.log('📚 Creating subjects...');
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH101',
        teacherId: teacher1User.teacher!.id,
        classId: class1.id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Science',
        code: 'SCI101',
        teacherId: teacher1User.teacher!.id,
        classId: class1.id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'English',
        code: 'ENG101',
        teacherId: teacher2User.teacher!.id,
        classId: class2.id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'History',
        code: 'HIS101',
        teacherId: teacher2User.teacher!.id,
        classId: class2.id,
      },
    }),
  ]);

  // Create parents and students
  console.log('👥 Creating parents and students...');
  const parents = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const parentPassword = await bcrypt.hash('parent123', 10);
      return prisma.user.create({
        data: {
          name: `Parent ${i + 1}`,
          email: `parent${i + 1}@school.com`,
          password: parentPassword,
          role: 'PARENT',
          parent: {
            create: {},
          },
        },
        include: {
          parent: true,
        },
      });
    })
  );

  const students = await Promise.all(
    parents.map(async (parent, i) => {
      const studentPassword = await bcrypt.hash('student123', 10);
      const user = await prisma.user.create({
        data: {
          name: `Student ${i + 1}`,
          email: `student${i + 1}@school.com`,
          password: studentPassword,
          role: 'STUDENT',
          student: {
            create: {
              classId: i < 5 ? class1.id : class2.id,
              rollNumber: `ROLL${i + 1}`,
              parentId: parent.parent!.id,
            },
          },
        },
        include: {
          student: true,
        },
      });
      return user.student!;
    })
  );

  // Create attendance records
  console.log('📝 Creating attendance records...');
  const today = new Date();
  await Promise.all(
    students.map((student: Student) =>
      prisma.attendance.create({
        data: {
          date: today,
          status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT',
          studentId: student.id,
        },
      })
    )
  );

  // Create assignments
  console.log('📚 Creating assignments...');
  const assignments = await Promise.all(
    subjects.map((subject) =>
      prisma.assignment.create({
        data: {
          title: `Assignment for ${subject.name}`,
          description: 'Complete this assignment by the due date',
          dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          teacherId: subject.teacherId,
          subjectId: subject.id,
        },
      })
    )
  );

  // Create assignment submissions
  console.log('📝 Creating assignment submissions...');
  await Promise.all(
    students.map((student: Student) =>
      assignments.map((assignment) =>
        prisma.assignmentSubmission.create({
          data: {
            assignmentId: assignment.id,
            studentId: student.id,
            content: `Submission for ${assignment.title}`,
            status: Math.random() > 0.3 ? 'SUBMITTED' : 'PENDING',
            grade: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : null,
            feedback: Math.random() > 0.5 ? 'Good work!' : null,
          },
        })
      )
    ).flat()
  );

  // Create exams
  console.log('📝 Creating exams...');
  const exams = await Promise.all(
    subjects.map((subject) =>
      prisma.exam.create({
        data: {
          title: `Exam for ${subject.name}`,
          description: 'Complete this exam within the time limit',
          startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          endDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          type: 'REGULAR',
          subjectId: subject.id,
        },
      })
    )
  );

  // Create questions for each exam
  console.log('📝 Creating questions...');
  await Promise.all(
    exams.map((exam) =>
      prisma.question.create({
        data: {
          examId: exam.id,
          text: 'Sample question',
          type: 'MULTIPLE_CHOICE',
          options: ['A', 'B', 'C', 'D'],
          answer: 'A',
          marks: 10,
        },
      })
    )
  );

  // Create fee payments
  console.log('💰 Creating fee payments...');
  await Promise.all(
    students.map((student: Student) =>
      prisma.feePayment.create({
        data: {
          studentId: student.id,
          description: 'Monthly Tuition Fee',
          amount: 5000,
          dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: Math.random() > 0.3 ? 'PAID' : 'PENDING',
          paidDate: Math.random() > 0.3 ? new Date() : null,
        },
      })
    )
  );

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 