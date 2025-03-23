import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import { ResourceType } from '@prisma/client';
import { Session } from 'next-auth';

interface CustomSession extends Session {
  user: {
    id: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  };
}

const createMaterialSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.nativeEnum(ResourceType),
  fileUrl: z.string().min(1, 'File URL is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const validatedData = createMaterialSchema.parse(data);

    // Get the teacher's ID
    const teacher = await prisma.teacher.findFirst({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Create the material
    const material = await prisma.materialResource.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        fileUrl: validatedData.fileUrl,
        subjectId: validatedData.subjectId,
        classId: validatedData.classId,
        teacherId: teacher.id,
      },
      include: {
        subject: true,
        class: true,
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
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error creating material:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create material' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions) as CustomSession;

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const teacherId = searchParams.get('teacherId');

    // Get user role and related info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    let materials;
    if (user.role === 'TEACHER' && user.teacher) {
      // Teachers see their own materials
      materials = await prisma.materialResource.findMany({
        where: {
          teacherId: user.teacher.id,
          ...(classId && { classId }),
          ...(subjectId && { subjectId }),
        },
        include: {
          subject: true,
          class: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'STUDENT' && user.student) {
      // Students see materials for their class
      materials = await prisma.materialResource.findMany({
        where: {
          classId: user.student.classId,
          ...(subjectId && { subjectId }),
        },
        include: {
          subject: true,
          class: true,
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
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.json(materials);
  } catch (error) {
    console.error('[MATERIALS_GET]', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
} 