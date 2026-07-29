import { randomUUID } from 'node:crypto';
import { ForbiddenError, NotFoundError } from '../../../shared/domain/DomainError.js';
import type { ClientRepository } from '../domain/ClientRepository.js';
import type { ClientStatus } from '@prisma/client';

export class CreateClientUseCase {
  constructor(private readonly clients: ClientRepository) {}

  async execute(input: {
    trainerId: string;
    fullName: string;
    email?: string;
    phone?: string;
    goals?: string;
    injuries?: string;
    notes?: string;
  }) {
    return this.clients.create({
      id: randomUUID(),
      trainerId: input.trainerId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      goals: input.goals,
      injuries: input.injuries,
      notes: input.notes,
    });
  }
}

export class ListClientsUseCase {
  constructor(private readonly clients: ClientRepository) {}

  async execute(trainerId: string) {
    return this.clients.listByTrainer(trainerId);
  }
}

export class GetClientUseCase {
  constructor(private readonly clients: ClientRepository) {}

  async execute(clientId: string, trainerId: string) {
    const client = await this.clients.findById(clientId);
    if (!client) throw new NotFoundError('Cliente no encontrado');
    if (!client.belongsToTrainer(trainerId)) {
      throw new ForbiddenError('Este cliente no pertenece a tu cuenta');
    }
    return client;
  }
}

export class UpdateClientUseCase {
  constructor(private readonly clients: ClientRepository) {}

  async execute(
    clientId: string,
    trainerId: string,
    data: Partial<{
      fullName: string;
      email: string | null;
      phone: string | null;
      goals: string | null;
      injuries: string | null;
      notes: string | null;
      status: ClientStatus;
    }>,
  ) {
    const client = await this.clients.findById(clientId);
    if (!client) throw new NotFoundError('Cliente no encontrado');
    if (!client.belongsToTrainer(trainerId)) {
      throw new ForbiddenError('Este cliente no pertenece a tu cuenta');
    }
    return this.clients.update(clientId, data);
  }
}
