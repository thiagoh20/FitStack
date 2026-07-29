import type { ClientStatus } from '@prisma/client';
import type { Client } from './Client.js';

export type CreateClientInput = {
  id: string;
  trainerId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  goals?: string | null;
  injuries?: string | null;
  notes?: string | null;
};

export interface ClientRepository {
  create(input: CreateClientInput): Promise<Client>;
  listByTrainer(trainerId: string): Promise<Client[]>;
  findById(id: string): Promise<Client | null>;
  update(
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
  ): Promise<Client>;
}
