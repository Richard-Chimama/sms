import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected successfully!');

    // Check if database is empty
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      console.log('Database already has data. Skipping initialization.');
      return;
    }

    console.log('Initializing database with seed data...');

    // Create admin user
    const adminPassword = await hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
      },
    });
    console.log('Created admin user:', admin.email);

    // Create teacher
    const teacherPassword = await hash('teacher123', 12);
    const teacher = await prisma.user.create({
      data: {
        email: 'teacher@example.com',
        name: 'Teacher User',
        password: teacherPassword,
        role: 'TEACHER',
        firstName: 'Teacher',
        lastName: 'User',
      },
    });

    // Create teacher profile
    const teacherProfile = await prisma.teacher.create({
      data: {
        userId: teacher.id,
        employeeId: 'T001',
      },
    });
    console.log('Created teacher:', teacher.email);

    // Create a class
    const class1 = await prisma.class.create({
      data: {
        grade: '1',
        section: 'A',
        teacherId: teacherProfile.id,
      },
    });
    console.log('Created class: Grade', class1.grade, 'Section', class1.section);

    // Create student
    const studentPassword = await hash('student123', 12);
    const student = await prisma.user.create({
      data: {
        email: 'student@example.com',
        name: 'Student User',
        password: studentPassword,
        role: 'STUDENT',
        firstName: 'Student',
        lastName: 'User',
      },
    });

    // Create student profile
    await prisma.student.create({
      data: {
        userId: student.id,
        classId: class1.id,
        rollNumber: 'S001',
      },
    });
    console.log('Created student:', student.email);

    // Create subjects
    const subjects = ['Mathematics', 'Science', 'English'];
    for (const subjectName of subjects) {
      const subject = await prisma.subject.create({
        data: {
          name: subjectName,
          code: subjectName.substring(0, 3).toUpperCase(),
          classId: class1.id,
          teacherId: teacherProfile.id,
        },
      });
      console.log('Created subject:', subject.name);
    }

    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error: Error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }); 