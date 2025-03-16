import { PrismaClient, ExamType, QuestionType, ExamSubmissionStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clean up existing data
    await prisma.examSubmission.deleteMany();
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.assignmentSubmission.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.examResult.deleteMany();
    await prisma.feePayment.deleteMany();
    await prisma.student.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.teacherDuty.deleteMany();
    await prisma.teacherTimetable.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.class.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    console.log('🧹 Cleaned up the database...');

    // Create admin user
    const adminPassword = await hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        password: adminPassword,
        role: 'ADMIN',
      },
    });

    console.log('👑 Created admin user...');

    // Create users
    const teacherPassword = await hash('teacher123', 12);
    const studentPassword = await hash('student123', 12);
    const parentPassword = await hash('parent123', 12);

    const teacher = await prisma.user.create({
      data: {
        email: 'teacher@example.com',
        name: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        password: teacherPassword,
        role: 'TEACHER',
      },
    });

    const parent = await prisma.user.create({
      data: {
        email: 'parent@example.com',
        name: 'Mary Johnson',
        firstName: 'Mary',
        lastName: 'Johnson',
        password: parentPassword,
        role: 'PARENT',
      },
    });

    const student = await prisma.user.create({
      data: {
        email: 'student@example.com',
        name: 'Tom Johnson',
        firstName: 'Tom',
        lastName: 'Johnson',
        password: studentPassword,
        role: 'STUDENT',
      },
    });

    console.log('👥 Created users...');

    // Create teacher profile
    const teacherProfile = await prisma.teacher.create({
      data: {
        userId: teacher.id,
        employeeId: 'T001',
      },
    });

    // Create parent profile
    const parentProfile = await prisma.parent.create({
      data: {
        userId: parent.id,
      },
    });

    console.log('👨‍🏫 Created teacher and parent profiles...');

    // Create class
    const class10A = await prisma.class.create({
      data: {
        grade: '10',
        section: 'A',
        teacherId: teacherProfile.id,
      },
    });

    console.log('🏫 Created class...');

    // Create student profile
    const studentProfile = await prisma.student.create({
      data: {
        userId: student.id,
        classId: class10A.id,
        rollNumber: '1001',
        parentId: parentProfile.id,
      },
    });

    console.log('👨‍🎓 Created student profile...');

    // Create subjects
    const subjects = await Promise.all([
      prisma.subject.create({
        data: {
          name: 'Mathematics',
          code: 'MATH101',
          teacherId: teacherProfile.id,
          classId: class10A.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: 'Physics',
          code: 'PHY101',
          teacherId: teacherProfile.id,
          classId: class10A.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: 'Chemistry',
          code: 'CHEM101',
          teacherId: teacherProfile.id,
          classId: class10A.id,
        },
      }),
    ]);

    console.log('📚 Created subjects...');

    // Create exams
    const mathExam = await prisma.exam.create({
      data: {
        title: 'Midterm Mathematics Exam',
        description: 'Covers algebra and geometry',
        type: ExamType.MIDTERM,
        startDate: new Date('2024-04-01T09:00:00Z'),
        endDate: new Date('2024-04-01T11:00:00Z'),
        subjectId: subjects[0].id,
      },
    });

    // Create questions for math exam
    const questions = await Promise.all([
      prisma.question.create({
        data: {
          examId: mathExam.id,
          text: 'What is the formula for the area of a circle?',
          type: QuestionType.SHORT_ANSWER,
          answer: 'πr²',
          marks: 5,
        },
      }),
      prisma.question.create({
        data: {
          examId: mathExam.id,
          text: 'Solve the equation: 2x + 5 = 15',
          type: QuestionType.SHORT_ANSWER,
          answer: 'x = 5',
          marks: 5,
        },
      }),
      prisma.question.create({
        data: {
          examId: mathExam.id,
          text: 'Which of these is the Pythagorean theorem?',
          type: QuestionType.MULTIPLE_CHOICE,
          options: ['a² + b² = c²', 'a + b = c', 'a × b = c', '(a + b)² = c'],
          answer: 'a² + b² = c²',
          marks: 5,
        },
      }),
    ]);

    console.log('📝 Created exam and questions...');

    // Create assignments
    const assignments = await Promise.all([
      prisma.assignment.create({
        data: {
          title: 'Algebra Practice',
          description: 'Complete exercises 1-10 from Chapter 3',
          dueDate: new Date('2024-04-15T23:59:59Z'),
          teacherId: teacherProfile.id,
          subjectId: subjects[0].id,
        },
      }),
      prisma.assignment.create({
        data: {
          title: 'Geometry Project',
          description: 'Create a presentation about geometric shapes',
          dueDate: new Date('2024-04-20T23:59:59Z'),
          teacherId: teacherProfile.id,
          subjectId: subjects[0].id,
        },
      }),
    ]);

    console.log('📚 Created assignments...');

    // Create assignment submissions
    await Promise.all([
      prisma.assignmentSubmission.create({
        data: {
          assignmentId: assignments[0].id,
          studentId: studentProfile.id,
          content: 'Here are my solutions to the algebra exercises...',
          status: 'SUBMITTED',
        },
      }),
    ]);

    console.log('📨 Created assignment submissions...');

    // Create exam submission
    const examSubmission = await prisma.examSubmission.create({
      data: {
        examId: mathExam.id,
        studentId: studentProfile.id,
        status: ExamSubmissionStatus.SUBMITTED,
        startedAt: new Date('2024-04-01T09:00:00Z'),
        submittedAt: new Date('2024-04-01T10:30:00Z'),
      },
    });

    // Create answers for the exam submission
    await Promise.all(
      questions.map((question) =>
        prisma.answer.create({
          data: {
            questionId: question.id,
            submissionId: examSubmission.id,
            answer: question.type === QuestionType.MULTIPLE_CHOICE ? 'a² + b² = c²' : 'Student answer',
            marks: question.marks,
          },
        })
      )
    );

    console.log('✅ Created exam submission and answers...');

    console.log('🌱 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding the database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 