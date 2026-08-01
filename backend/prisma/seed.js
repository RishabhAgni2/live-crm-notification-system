const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {},
    create: {
      email: 'admin@crm.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@crm.com' },
    update: {},
    create: {
      email: 'user@crm.com',
      name: 'Normal User',
      password: userPassword,
      role: 'USER',
    },
  });

  // Avoid duplicating companies if seed is re-run
  const existing = await prisma.company.findFirst({ where: { name: 'Acme Corp' } });

  let company1 = existing;
  let company2 = null;

  if (!existing) {
    company1 = await prisma.company.create({
      data: {
        name: 'Acme Corp',
        industry: 'Technology',
        address: '123 Tech Lane',
        contacts: {
          create: [{ name: 'Alice Smith', email: 'alice@acme.com', phone: '123-456-7890' }],
        },
      },
    });

    company2 = await prisma.company.create({
      data: {
        name: 'Globex Inc',
        industry: 'Manufacturing',
        address: '456 Globe Blvd',
        contacts: {
          create: [{ name: 'Bob Jones', email: 'bob@globex.com', phone: '987-654-3210' }],
        },
      },
    });
  }

  console.log('Seeding complete!');
  console.log({ admin: admin.email, normalUser: normalUser.email, company1: company1?.name, company2: company2?.name });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
