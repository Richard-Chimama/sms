import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileForm from '@/components/profile/ProfileForm';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import { Session } from 'next-auth';

export default async function ProfilePage() {
  const session = (await getServerSession(authOptions)) as Session;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Fetch user details including role-specific information
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      student: {
        include: {
          class: true,
          parent: {
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
          classes: true,
          subjects: true,
        },
      },
      parent: {
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              class: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {user.role === 'STUDENT' && user.student && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Class</h3>
                <p>Grade {user.student.class.grade}-{user.student.class.section}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Roll Number</h3>
                <p>{user.student.rollNumber}</p>
              </div>
              <div className="col-span-2">
                <h3 className="font-semibold mb-2">Parent Information</h3>
                <p>
                  {user.student.parent.user.firstName}{' '}
                  {user.student.parent.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.student.parent.user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user.role === 'TEACHER' && user.teacher && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {user.teacher.classes.map((class_) => (
                  <Card key={class_.id}>
                    <CardContent className="pt-4">
                      <p className="font-medium">
                        Grade {class_.grade}-{class_.section}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Class Teacher
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {user.teacher.subjects.map((subject) => (
                  <Card key={subject.id}>
                    <CardContent className="pt-4">
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {subject.code}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {user.role === 'PARENT' && user.parent?.student && (
        <Card>
          <CardHeader>
            <CardTitle>Ward Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Student Name</h3>
                <p>
                  {user.parent.student.user.firstName}{' '}
                  {user.parent.student.user.lastName}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Class</h3>
                <p>
                  Grade {user.parent.student.class.grade}-
                  {user.parent.student.class.section}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 