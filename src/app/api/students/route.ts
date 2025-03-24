import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

interface CustomSession extends Session {
  user: {
    id: string;
    role: string;
  } & Session['user'];
}

const createStudentSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(6),
  classId: z.string().min(1),
  rollNumber: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  parentEmail: z.string().email().optional(),
  parentFirstName: z.string().min(1).optional(),
  parentLastName: z.string().min(1).optional(),
  parentPassword: z.string().min(6).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = createStudentSchema.parse(body);

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return new NextResponse('Student with this email already exists', { status: 400 });
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: validatedData.classId },
    });

    if (!existingClass) {
      return new NextResponse('Invalid class ID', { status: 400 });
    }

    // Check if roll number is unique in the class
    const existingRollNumber = await prisma.student.findFirst({
      where: {
        classId: validatedData.classId,
        rollNumber: validatedData.rollNumber,
      },
    });

    if (existingRollNumber) {
      return new NextResponse('Roll number already exists in this class', { status: 400 });
    }

    // Hash student password
    const hashedStudentPassword = await bcrypt.hash(validatedData.password, 10);

    // Create student and optionally create parent in a transaction
    const newStudent = await prisma.$transaction(async (tx) => {
      let parentId = null;

      // Create parent if information is provided
      if (validatedData.parentEmail && validatedData.parentFirstName && validatedData.parentLastName && validatedData.parentPassword) {
        // Check if parent with email already exists
        const existingParent = await tx.user.findUnique({
          where: { email: validatedData.parentEmail },
        });

        if (existingParent) {
          throw new Error('Parent with this email already exists');
        }

        // Hash parent password
        const hashedParentPassword = await bcrypt.hash(validatedData.parentPassword!, 10);

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

        parentId = parent.id;
      }

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
          dateOfBirth: new Date(validatedData.dateOfBirth),
          gender: validatedData.gender,
          parentId: parentId,
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
      return new NextResponse(JSON.stringify({ error: 'Invalid request data', details: error.errors }), { status: 400 });
    }

    console.error('Error creating student:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    const students = await prisma.student.findMany({
      where: classId ? { classId } : undefined,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        class: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 