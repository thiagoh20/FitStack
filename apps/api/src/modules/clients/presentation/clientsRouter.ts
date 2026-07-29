import { Router } from 'express';
import { z } from 'zod';
import { ClientStatus } from '@prisma/client';
import { requireAuth, requireRole } from '../../../shared/infrastructure/http/authMiddleware.js';
import { DomainError, UnauthorizedError } from '../../../shared/domain/DomainError.js';
import { PrismaUserRepository } from '../../identity/infrastructure/PrismaUserRepository.js';
import { PrismaClientRepository } from '../infrastructure/PrismaClientRepository.js';
import {
  CreateClientUseCase,
  GetClientUseCase,
  ListClientsUseCase,
  UpdateClientUseCase,
} from '../application/ClientUseCases.js';

const clients = new PrismaClientRepository();
const users = new PrismaUserRepository();

export const clientsRouter = Router();

clientsRouter.use(requireAuth, requireRole('TRAINER'));

async function trainerProfileId(userId: string): Promise<string> {
  const id = await users.getTrainerProfileId(userId);
  if (!id) throw new UnauthorizedError('Perfil de entrenador no encontrado');
  return id;
}

clientsRouter.get('/', async (req, res, next) => {
  try {
    const trainerId = await trainerProfileId(req.auth!.sub);
    const list = await new ListClientsUseCase(clients).execute(trainerId);
    res.json(list.map((c) => c.toJSON()));
  } catch (error) {
    next(error);
  }
});

clientsRouter.post('/', async (req, res, next) => {
  try {
    const body = z
      .object({
        fullName: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        goals: z.string().optional(),
        injuries: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(req.body);

    const trainerId = await trainerProfileId(req.auth!.sub);
    const client = await new CreateClientUseCase(clients).execute({
      trainerId,
      ...body,
    });
    res.status(201).json(client.toJSON());
  } catch (error) {
    next(mapZod(error));
  }
});

clientsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const trainerId = await trainerProfileId(req.auth!.sub);
    const client = await new GetClientUseCase(clients).execute(id, trainerId);
    res.json(client.toJSON());
  } catch (error) {
    next(error);
  }
});

clientsRouter.patch('/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const body = z
      .object({
        fullName: z.string().min(1).optional(),
        email: z.string().email().nullable().optional(),
        phone: z.string().nullable().optional(),
        goals: z.string().nullable().optional(),
        injuries: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        status: z.nativeEnum(ClientStatus).optional(),
      })
      .parse(req.body);

    const trainerId = await trainerProfileId(req.auth!.sub);
    const client = await new UpdateClientUseCase(clients).execute(id, trainerId, body);
    res.json(client.toJSON());
  } catch (error) {
    next(mapZod(error));
  }
});

function mapZod(error: unknown) {
  if (error instanceof z.ZodError) {
    return new DomainError(error.errors[0]?.message ?? 'Datos inválidos', 'VALIDATION_ERROR', 400);
  }
  return error;
}
