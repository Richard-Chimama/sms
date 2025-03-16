import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const studentId = params.id;

    // Update student and related user information
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        rollNumber: data.rollNumber,
        user: {
          update: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          },
        },
        parent: {
          update: {
            user: {
              update: {
                firstName: data.parentFirstName,
                lastName: data.parentLastName,
                email: data.parentEmail,
              },
            },
          },
        },
      },
      include: {
        user: true,
        parent: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id;

    // Get the student's user ID and parent's user ID before deletion
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        parent: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete the student record first
    await prisma.student.delete({
      where: { id: studentId },
    });

    // Delete the parent record
    await prisma.parent.delete({
      where: { id: student.parentId },
    });

    // Delete the associated user records
    await prisma.user.delete({
      where: { id: student.userId },
    });

    await prisma.user.delete({
      where: { id: student.parent.userId },
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
        assignments: {
          include: {
            subject: true,
          },
          orderBy: {
            dueDate: 'desc',
          },
        },
        parent: {
          include: {
            user: true,
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
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
} 