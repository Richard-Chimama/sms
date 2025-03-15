import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createStudentSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(6),
  classId: z.string().min(1),
  rollNumber: z.string().min(1),
  parentEmail: z.string().email(),
  parentFirstName: z.string().min(1),
  parentLastName: z.string().min(1),
  parentPassword: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createStudentSchema.parse(body);

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Student with this email already exists' },
        { status: 400 }
      );
    }

    // Check if parent with email already exists
    const existingParent = await prisma.user.findUnique({
      where: { email: validatedData.parentEmail },
    });

    if (existingParent) {
      return NextResponse.json(
        { error: 'Parent with this email already exists' },
        { status: 400 }
      );
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: validatedData.classId },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    // Check if roll number is unique in the class
    const existingRollNumber = await prisma.student.findFirst({
      where: {
        classId: validatedData.classId,
        rollNumber: validatedData.rollNumber,
      },
    });

    if (existingRollNumber) {
      return NextResponse.json(
        { error: 'Roll number already exists in this class' },
        { status: 400 }
      );
    }

    // Hash passwords
    const hashedStudentPassword = await bcrypt.hash(validatedData.password, 10);
    const hashedParentPassword = await bcrypt.hash(validatedData.parentPassword, 10);

    // Create student and parent in a transaction
    const newStudent = await prisma.$transaction(async (tx) => {
      // Create parent user and profile
      const parentUser = await tx.user.create({
        data: {
          email: validatedData.parentEmail,
          firstName: validatedData.parentFirstName,
          lastName: validatedData.parentLastName,
          password: hashedParentPassword,
          role: 'PARENT',
        },
      });

      const parent = await tx.parent.create({
        data: {
          userId: parentUser.id,
        },
      });

      // Create student user and profile
      const studentUser = await tx.user.create({
        data: {
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          password: hashedStudentPassword,
          role: 'STUDENT',
        },
      });

      return tx.student.create({
        data: {
          userId: studentUser.id,
          classId: validatedData.classId,
          rollNumber: validatedData.rollNumber,
          parentId: parent.id,
        },
        include: {
          user: true,
          class: {
            include: {
              teacher: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const students = await prisma.student.findMany({
      include: {
        user: true,
        class: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 