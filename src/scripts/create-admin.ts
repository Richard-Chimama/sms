import { hash } from 'bcryptjs';
import prisma from '../lib/db/prisma';

async function main() {
  const password = await hash('admin123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      password,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 