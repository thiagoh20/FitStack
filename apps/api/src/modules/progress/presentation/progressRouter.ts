import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../../shared/infrastructure/prisma.js';
import { requireAuth, requireRole } from '../../../shared/infrastructure/http/authMiddleware.js';
import {
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../../shared/domain/DomainError.js';
import { PrismaUserRepository } from '../../identity/infrastructure/PrismaUserRepository.js';

const users = new PrismaUserRepository();
export const progressRouter = Router();

async function assertTrainerOwnsClient(userId: string, clientId: string) {
  const trainerId = await users.getTrainerProfileId(userId);
  if (!trainerId) throw new UnauthorizedError('Perfil de entrenador no encontrado');
  const client = await prisma.clientProfile.findUnique({ where: { id: clientId } });
  if (!client) throw new NotFoundError('Cliente no encontrado');
  if (client.trainerId !== trainerId) throw new ForbiddenError();
  return client;
}

progressRouter.get(
  '/clients/:clientId/progress',
  requireAuth,
  requireRole('TRAINER'),
  async (req, res, next) => {
    try {
      const clientId = String(req.params.clientId);
      await assertTrainerOwnsClient(req.auth!.sub, clientId);
      const entries = await prisma.progressEntry.findMany({
        where: { clientId },
        orderBy: { recordedAt: 'desc' },
      });
      res.json(entries);
    } catch (error) {
      next(error);
    }
  },
);

progressRouter.post(
  '/clients/:clientId/progress',
  requireAuth,
  requireRole('TRAINER', 'CLIENT'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          weightKg: z.number().positive().optional(),
          bodyFatPct: z.number().min(0).max(100).optional(),
          measurements: z.record(z.number()).optional(),
          notes: z.string().optional(),
          recordedAt: z.string().datetime().optional(),
        })
        .parse(req.body);

      const clientId = String(req.params.clientId);

      if (req.auth!.role === 'CLIENT') {
        const ownId = await users.getClientProfileId(req.auth!.sub);
        if (!ownId || ownId !== clientId) throw new ForbiddenError();
      } else {
        await assertTrainerOwnsClient(req.auth!.sub, clientId);
      }

      const entry = await prisma.progressEntry.create({
        data: {
          id: randomUUID(),
          clientId,
          weightKg: body.weightKg,
          bodyFatPct: body.bodyFatPct,
          measurements: body.measurements,
          notes: body.notes,
          recordedAt: body.recordedAt ? new Date(body.recordedAt) : undefined,
        },
      });

      res.status(201).json(entry);
    } catch (error) {
      next(mapZod(error));
    }
  },
);

progressRouter.post(
  '/clients/:clientId/session-logs',
  requireAuth,
  requireRole('TRAINER', 'CLIENT'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          workoutId: z.string().uuid(),
          rpe: z.number().int().min(1).max(10).optional(),
          notes: z.string().optional(),
          performedAt: z.string().datetime().optional(),
        })
        .parse(req.body);

      const clientId = String(req.params.clientId);

      if (req.auth!.role === 'CLIENT') {
        const ownId = await users.getClientProfileId(req.auth!.sub);
        if (!ownId || ownId !== clientId) throw new ForbiddenError();
      } else {
        await assertTrainerOwnsClient(req.auth!.sub, clientId);
      }

      const log = await prisma.sessionLog.create({
        data: {
          id: randomUUID(),
          clientId,
          workoutId: body.workoutId,
          rpe: body.rpe,
          notes: body.notes,
          performedAt: body.performedAt ? new Date(body.performedAt) : undefined,
        },
      });

      res.status(201).json(log);
    } catch (error) {
      next(mapZod(error));
    }
  },
);

progressRouter.get('/my-progress', requireAuth, requireRole('CLIENT'), async (req, res, next) => {
  try {
    const clientId = await users.getClientProfileId(req.auth!.sub);
    if (!clientId) throw new UnauthorizedError('Perfil de cliente no encontrado');

    const [progress, sessions] = await Promise.all([
      prisma.progressEntry.findMany({
        where: { clientId },
        orderBy: { recordedAt: 'desc' },
      }),
      prisma.sessionLog.findMany({
        where: { clientId },
        include: { workout: true },
        orderBy: { performedAt: 'desc' },
      }),
    ]);

    res.json({ progress, sessions });
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
