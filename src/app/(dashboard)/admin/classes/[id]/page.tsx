import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import ClassDetails from '@/components/admin/ClassDetails';

export default async function ClassPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return notFound();
  }

  const class_ = await prisma.class.findUnique({
    where: { id: params.id },
    include: {
      students: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              image: true,
            },
          },
        },
      },
      subjects: {
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      teacher: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!class_) {
    return notFound();
  }

  // Fetch all teachers for subject assignment
  const teachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto py-6">
      <ClassDetails class_={class_} teachers={teachers} />
    </div>
  );
} 