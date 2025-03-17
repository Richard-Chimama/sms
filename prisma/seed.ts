import { PrismaClient, User, Student, Teacher, Parent } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaned up the database...');
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
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.noticeComment.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👑 Created admin user...');
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
  console.log('👨‍🏫 Created teachers...');
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
  console.log('🏫 Created classes...');
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
  console.log('📚 Created subjects...');
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
  console.log('👥 Created parents and students...');
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
  console.log('📝 Created attendance records...');
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
  console.log('📚 Created assignments...');
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
  console.log('📝 Created assignment submissions...');
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
  console.log('📝 Created exams...');
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
  console.log('📝 Created questions...');
  const questions = await Promise.all(
    exams.map((exam) =>
      Promise.all([
        prisma.question.create({
          data: {
            examId: exam.id,
            text: 'What is the capital of France?',
            type: 'MULTIPLE_CHOICE',
            options: ['London', 'Paris', 'Berlin', 'Madrid'],
            answer: 'Paris',
            marks: 1,
          },
        }),
        prisma.question.create({
          data: {
            examId: exam.id,
            text: 'Explain the concept of gravity.',
            type: 'LONG_ANSWER',
            answer: 'Gravity is a fundamental force...',
            marks: 5,
          },
        }),
      ])
    ).flat()
  );

  // Create exam submissions
  console.log('📝 Created exam submissions...');
  const examSubmissions = await Promise.all(
    students.map((student: Student) =>
      exams.map((exam) =>
        prisma.examSubmission.create({
          data: {
            examId: exam.id,
            studentId: student.id,
            status: Math.random() > 0.3 ? 'SUBMITTED' : 'IN_PROGRESS',
            submittedAt: Math.random() > 0.3 ? new Date() : null,
            totalMarks: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : null,
          },
        })
      )
    ).flat()
  );

  // Create answers for exam submissions
  console.log('📝 Created answers...');
  await Promise.all(
    examSubmissions.map((submission) =>
      questions
        .filter((questionGroup) => questionGroup[0].examId === submission.examId)
        .flat()
        .map((question) =>
          prisma.answer.create({
            data: {
              questionId: question.id,
              submissionId: submission.id,
              answer: 'Sample answer',
              marks: Math.random() > 0.5 ? Math.floor(Math.random() * question.marks) : null,
              feedback: Math.random() > 0.5 ? 'Good answer!' : null,
            },
          })
        )
    ).flat()
  );

  // Create exam results
  console.log('📝 Created exam results...');
  await Promise.all(
    students.map((student: Student) =>
      subjects.map((subject) =>
        prisma.examResult.create({
          data: {
            marks: Math.floor(Math.random() * 100),
            totalMarks: 100,
            date: new Date(),
            studentId: student.id,
            subjectId: subject.id,
          },
        })
      )
    ).flat()
  );

  // Create fee payments
  console.log('💰 Created fee payments...');
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

  // Create notices
  console.log('📨 Created notices...');
  const notices = await Promise.all([
    prisma.notice.create({
      data: {
        title: 'School Holiday',
        content: 'School will be closed for summer vacation from next week.',
        category: 'GENERAL',
        authorId: admin.id,
        pinned: true,
      },
    }),
    prisma.notice.create({
      data: {
        title: 'Exam Schedule',
        content: 'Final exams will begin from next month.',
        category: 'EXAM',
        authorId: admin.id,
        pinned: true,
      },
    }),
    prisma.notice.create({
      data: {
        title: 'Parent-Teacher Meeting',
        content: 'Parent-teacher meeting will be held next week.',
        category: 'PARENT',
        authorId: admin.id,
        pinned: false,
      },
    }),
  ]);

  // Create notice comments
  console.log('💬 Created notice comments...');
  await Promise.all(
    notices.map((notice) =>
      Promise.all([
        prisma.noticeComment.create({
          data: {
            content: 'Thank you for the information.',
            noticeId: notice.id,
            authorId: parents[0].id,
          },
        }),
        prisma.noticeComment.create({
          data: {
            content: 'When exactly will the meeting be held?',
            noticeId: notice.id,
            authorId: parents[1].id,
          },
        }),
      ])
    ).flat()
  );

  // Create teacher timetables
  console.log('📅 Created teacher timetables...');
  await Promise.all([
    prisma.teacherTimetable.create({
      data: {
        teacherId: teacher1User.teacher!.id,
        classId: class1.id,
        subjectId: subjects[0].id,
        dayOfWeek: 'MONDAY',
        startTime: new Date('1970-01-01T09:00:00.000Z'),
        endTime: new Date('1970-01-01T10:00:00.000Z'),
      },
    }),
    prisma.teacherTimetable.create({
      data: {
        teacherId: teacher2User.teacher!.id,
        classId: class2.id,
        subjectId: subjects[2].id,
        dayOfWeek: 'MONDAY',
        startTime: new Date('1970-01-01T10:00:00.000Z'),
        endTime: new Date('1970-01-01T11:00:00.000Z'),
      },
    }),
  ]);

  // Create teacher duties
  console.log('📅 Created teacher duties...');
  await Promise.all([
    prisma.teacherDuty.create({
      data: {
        teacherId: teacher1User.teacher!.id,
        type: 'MORNING_ASSEMBLY',
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        startTime: new Date('1970-01-01T08:00:00.000Z'),
        endTime: new Date('1970-01-01T09:00:00.000Z'),
        notes: 'Lead the morning assembly',
      },
    }),
    prisma.teacherDuty.create({
      data: {
        teacherId: teacher2User.teacher!.id,
        type: 'LUNCH_BREAK',
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        startTime: new Date('1970-01-01T12:00:00.000Z'),
        endTime: new Date('1970-01-01T13:00:00.000Z'),
        notes: 'Supervise lunch break',
      },
    }),
  ]);

  // Create chats
  console.log('💬 Created chats...');
  const chats = await Promise.all([
    prisma.chat.create({
      data: {
        name: 'Class 10A Group',
        type: 'CLASS',
      },
    }),
    prisma.chat.create({
      data: {
        name: 'Teachers Group',
        type: 'GROUP',
      },
    }),
  ]);

  // Create chat participants
  console.log('👥 Created chat participants...');
  await Promise.all([
    // Add all students from class1 to the class chat
    ...students
      .filter((student: Student) => student.classId === class1.id)
      .map((student: Student) =>
        prisma.chatParticipant.create({
          data: {
            chatId: chats[0].id,
            userId: student.userId,
            role: 'MEMBER',
          },
        })
      ),
    // Add teachers to the teachers group
    prisma.chatParticipant.create({
      data: {
        chatId: chats[1].id,
        userId: teacher1User.id,
        role: 'MEMBER',
      },
    }),
    prisma.chatParticipant.create({
      data: {
        chatId: chats[1].id,
        userId: teacher2User.id,
        role: 'MEMBER',
      },
    }),
  ]);

  // Create messages
  console.log('💬 Created messages...');
  await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hello everyone!',
        chatId: chats[0].id,
        userId: teacher1User.id,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Hi teacher!',
        chatId: chats[0].id,
        userId: students[0].userId,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Welcome to the teachers group!',
        chatId: chats[1].id,
        userId: teacher1User.id,
      },
    }),
  ]);

  // Create notifications
  console.log('🔔 Created notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'EXAM',
        title: 'New Exam Scheduled',
        content: 'A new exam has been scheduled for Mathematics.',
        isRead: false,
        userId: students[0].userId,
        senderId: teacher1User.id,
        link: '/exams',
      },
    }),
    prisma.notification.create({
      data: {
        type: 'ASSIGNMENT',
        title: 'New Assignment',
        content: 'A new assignment has been posted for Science.',
        isRead: false,
        userId: students[0].userId,
        senderId: teacher1User.id,
        link: '/assignments',
      },
    }),
    prisma.notification.create({
      data: {
        type: 'NOTICE',
        title: 'New Notice',
        content: 'A new notice has been posted.',
        isRead: false,
        userId: students[0].userId,
        senderId: admin.id,
        link: '/notices',
      },
    }),
  ]);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 