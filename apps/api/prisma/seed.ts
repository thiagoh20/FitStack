import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../src/shared/infrastructure/prisma.js';

async function main() {
  const passwordHash = await bcrypt.hash('trainer123', 10);

  const trainer = await prisma.user.upsert({
    where: { email: 'coach@fitstack.dev' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'coach@fitstack.dev',
      passwordHash,
      role: Role.TRAINER,
      trainerProfile: {
        create: {
          id: randomUUID(),
          displayName: 'Coach Demo',
          specialty: 'Fuerza e hipertrofia',
        },
      },
    },
    include: { trainerProfile: true },
  });

  if (trainer.trainerProfile) {
    await prisma.clientProfile.createMany({
      data: [
        {
          id: randomUUID(),
          trainerId: trainer.trainerProfile.id,
          fullName: 'Ana Gómez',
          email: 'ana@example.com',
          goals: 'Perder grasa y ganar fuerza',
        },
        {
          id: randomUUID(),
          trainerId: trainer.trainerProfile.id,
          fullName: 'Luis Pérez',
          email: 'luis@example.com',
          goals: 'Hipertrofia',
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log('Seed OK — coach@fitstack.dev / trainer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
