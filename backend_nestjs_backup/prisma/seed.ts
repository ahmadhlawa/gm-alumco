import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { AdminRole, PrismaClient } from '../src/generated/prisma/client.js';

function getRequiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to seed the admin.`);
  }

  return value;
}

const databaseUrl = getRequiredEnvironmentValue('DATABASE_URL');
const email = getRequiredEnvironmentValue('ADMIN_EMAIL').toLowerCase();
const password = getRequiredEnvironmentValue('ADMIN_PASSWORD');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: {
      name: process.env.ADMIN_NAME ?? 'Ofok Administrator',
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      email,
      name: process.env.ADMIN_NAME ?? 'Ofok Administrator',
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  console.log(`Admin seed completed for ${email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
