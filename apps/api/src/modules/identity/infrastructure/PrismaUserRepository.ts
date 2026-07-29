import { randomUUID } from 'node:crypto';
import { Role } from '@prisma/client';
import { prisma } from '../../../shared/infrastructure/prisma.js';
import { User } from '../domain/User.js';
import type { UserRepository } from '../domain/UserRepository.js';

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email } });
    if (!row) return null;
    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
    });
  }

  async save(user: User): Promise<void> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
      },
    });
  }

  async createTrainer(input: {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
  }): Promise<User> {
    const row = await prisma.user.create({
      data: {
        id: input.id,
        email: input.email,
        passwordHash: input.passwordHash,
        role: Role.TRAINER,
        trainerProfile: {
          create: {
            id: randomUUID(),
            displayName: input.displayName,
          },
        },
      },
    });

    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
    });
  }

  async createClientUser(input: {
    id: string;
    email: string;
    passwordHash: string;
    clientProfileId: string;
  }): Promise<User> {
    const row = await prisma.user.create({
      data: {
        id: input.id,
        email: input.email,
        passwordHash: input.passwordHash,
        role: Role.CLIENT,
        clientProfile: {
          connect: { id: input.clientProfileId },
        },
      },
    });

    await prisma.clientProfile.update({
      where: { id: input.clientProfileId },
      data: { inviteAccepted: true, userId: row.id },
    });

    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
    });
  }

  async saveRefreshToken(input: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.refreshToken.create({ data: input });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      select: { userId: true, expiresAt: true },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  async getTrainerProfileId(userId: string): Promise<string | null> {
    const profile = await prisma.trainerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    return profile?.id ?? null;
  }

  async getClientProfileId(userId: string): Promise<string | null> {
    const profile = await prisma.clientProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    return profile?.id ?? null;
  }

  async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        trainerProfile: {
          select: { id: true, displayName: true, specialty: true },
        },
        clientProfile: {
          select: { id: true, fullName: true, trainerId: true },
        },
      },
    });
  }
}
