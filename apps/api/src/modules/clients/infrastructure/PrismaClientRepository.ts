import { prisma } from '../../../shared/infrastructure/prisma.js';
import { Client } from '../domain/Client.js';
import type { ClientRepository, CreateClientInput } from '../domain/ClientRepository.js';
import type { ClientStatus } from '@prisma/client';

function map(row: {
  id: string;
  trainerId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  goals: string | null;
  injuries: string | null;
  notes: string | null;
  status: ClientStatus;
}): Client {
  return Client.create(row);
}

export class PrismaClientRepository implements ClientRepository {
  async create(input: CreateClientInput): Promise<Client> {
    const row = await prisma.clientProfile.create({
      data: {
        id: input.id,
        trainerId: input.trainerId,
        fullName: input.fullName,
        email: input.email ?? null,
        phone: input.phone ?? null,
        goals: input.goals ?? null,
        injuries: input.injuries ?? null,
        notes: input.notes ?? null,
      },
    });
    return map(row);
  }

  async listByTrainer(trainerId: string): Promise<Client[]> {
    const rows = await prisma.clientProfile.findMany({
      where: { trainerId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(map);
  }

  async findById(id: string): Promise<Client | null> {
    const row = await prisma.clientProfile.findUnique({ where: { id } });
    return row ? map(row) : null;
  }

  async update(
    id: string,
    data: Partial<{
      fullName: string;
      email: string | null;
      phone: string | null;
      goals: string | null;
      injuries: string | null;
      notes: string | null;
      status: ClientStatus;
    }>,
  ): Promise<Client> {
    const row = await prisma.clientProfile.update({ where: { id }, data });
    return map(row);
  }
}
