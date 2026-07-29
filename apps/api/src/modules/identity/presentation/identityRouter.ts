import { Router } from 'express';
import { z } from 'zod';
import { PrismaUserRepository } from '../infrastructure/PrismaUserRepository.js';
import {
  GetMeUseCase,
  LoginUseCase,
  RegisterClientAccountUseCase,
  RegisterTrainerUseCase,
} from '../application/AuthUseCases.js';
import { requireAuth } from '../../../shared/infrastructure/http/authMiddleware.js';
import { DomainError } from '../../../shared/domain/DomainError.js';

const users = new PrismaUserRepository();

export const identityRouter = Router();

identityRouter.post('/register-trainer', async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        displayName: z.string().min(1),
      })
      .parse(req.body);

    const result = await new RegisterTrainerUseCase(users).execute(body);
    res.status(201).json(result);
  } catch (error) {
    next(mapZod(error));
  }
});

identityRouter.post('/login', async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .parse(req.body);

    const result = await new LoginUseCase(users).execute(body);
    res.json(result);
  } catch (error) {
    next(mapZod(error));
  }
});

identityRouter.post('/register-client', async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        clientProfileId: z.string().uuid(),
      })
      .parse(req.body);

    const result = await new RegisterClientAccountUseCase(users).execute(body);
    res.status(201).json(result);
  } catch (error) {
    next(mapZod(error));
  }
});

identityRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const me = await new GetMeUseCase(users).execute(req.auth!.sub);
    res.json(me);
  } catch (error) {
    next(error);
  }
});

function mapZod(error: unknown) {
  if (error instanceof z.ZodError) {
    return new DomainError(error.errors[0]?.message ?? 'Datos inválidos', 'VALIDATION_ERROR', 400);
  }
  return error;
}
