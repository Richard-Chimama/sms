import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    const student = await prisma.student.update({
      where: { id: params.id },
      data: {
        classId: body.classId,
        rollNumber: body.rollNumber,
        user: {
          update: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
          },
        },
      },
      include: {
        user: true,
        class: true,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const studentId = params.id;

    // Get the student with parent information
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parent: true,
      },
    });

    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    // Delete the student record first
    await prisma.student.delete({
      where: { id: studentId },
    });

    // Delete the parent record if it exists
    if (student.parentId) {
      await prisma.parent.delete({
        where: { id: student.parentId },
      });

      // Delete the parent user record if it exists
      if (student.parent?.userId) {
        await prisma.user.delete({
          where: { id: student.parent.userId },
        });
      }
    }

    // Delete the student user record
    await prisma.user.delete({
      where: { id: student.userId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting student:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: params.id },
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
        attendances: {
          orderBy: {
            date: 'desc',
          },
        },
        examResults: {
          include: {
            subject: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
        submissions: {
          include: {
            assignment: {
              include: {
                subject: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        feePayments: {
          orderBy: {
            dueDate: 'desc',
          },
        },
      },
    });

    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 