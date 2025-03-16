import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FeesManagement from '@/components/admin/FeesManagement';

export default async function FeesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all classes with their students and fee payments
  const classes = await prisma.class.findMany({
    include: {
      students: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          feePayments: {
            orderBy: {
              dueDate: 'desc',
            },
          },
        },
      },
    },
    orderBy: {
      grade: 'asc',
    },
  });

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Fees Management</CardTitle>
        </CardHeader>
        <CardContent>
          <FeesManagement classes={classes} />
        </CardContent>
      </Card>
    </div>
  );
}

