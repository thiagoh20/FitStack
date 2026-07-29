import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { ProgramStatus } from '@prisma/client';
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
export const trainingRouter = Router();

async function trainerIdOf(userId: string) {
  const id = await users.getTrainerProfileId(userId);
  if (!id) throw new UnauthorizedError('Perfil de entrenador no encontrado');
  return id;
}

// ——— Exercises ———
trainingRouter.get('/exercises', requireAuth, requireRole('TRAINER'), async (req, res, next) => {
  try {
    const trainerId = await trainerIdOf(req.auth!.sub);
    const exercises = await prisma.exercise.findMany({
      where: { trainerId },
      orderBy: { name: 'asc' },
    });
    res.json(exercises);
  } catch (error) {
    next(error);
  }
});

trainingRouter.post('/exercises', requireAuth, requireRole('TRAINER'), async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(1),
        muscleGroup: z.string().optional(),
        equipment: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(req.body);

    const trainerId = await trainerIdOf(req.auth!.sub);
    const exercise = await prisma.exercise.create({
      data: { id: randomUUID(), trainerId, ...body },
    });
    res.status(201).json(exercise);
  } catch (error) {
    next(mapZod(error));
  }
});

// ——— Programs ———
trainingRouter.get('/programs', requireAuth, requireRole('TRAINER'), async (req, res, next) => {
  try {
    const trainerId = await trainerIdOf(req.auth!.sub);
    const programs = await prisma.program.findMany({
      where: { trainerId },
      include: { workouts: { include: { exercises: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(programs);
  } catch (error) {
    next(error);
  }
});

trainingRouter.post('/programs', requireAuth, requireRole('TRAINER'), async (req, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(1),
        description: z.string().optional(),
        durationWeeks: z.number().int().positive().default(4),
      })
      .parse(req.body);

    const trainerId = await trainerIdOf(req.auth!.sub);
    const program = await prisma.program.create({
      data: {
        id: randomUUID(),
        trainerId,
        name: body.name,
        description: body.description,
        durationWeeks: body.durationWeeks,
        status: ProgramStatus.DRAFT,
      },
    });
    res.status(201).json(program);
  } catch (error) {
    next(mapZod(error));
  }
});

trainingRouter.post(
  '/programs/:programId/workouts',
  requireAuth,
  requireRole('TRAINER'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          dayIndex: z.number().int().nonnegative(),
          name: z.string().min(1),
          notes: z.string().optional(),
          exercises: z
            .array(
              z.object({
                exerciseId: z.string().uuid(),
                sets: z.number().int().positive(),
                reps: z.string().min(1),
                restSec: z.number().int().optional(),
                notes: z.string().optional(),
                sortOrder: z.number().int().optional(),
              }),
            )
            .default([]),
        })
        .parse(req.body);

      const programId = String(req.params.programId);
      const trainerId = await trainerIdOf(req.auth!.sub);
      const program = await prisma.program.findUnique({ where: { id: programId } });
      if (!program) throw new NotFoundError('Programa no encontrado');
      if (program.trainerId !== trainerId) throw new ForbiddenError();

      const workout = await prisma.workout.create({
        data: {
          id: randomUUID(),
          programId: program.id,
          dayIndex: body.dayIndex,
          name: body.name,
          notes: body.notes,
          exercises: {
            create: body.exercises.map((ex, index) => ({
              id: randomUUID(),
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              restSec: ex.restSec,
              notes: ex.notes,
              sortOrder: ex.sortOrder ?? index,
            })),
          },
        },
        include: { exercises: true },
      });

      res.status(201).json(workout);
    } catch (error) {
      next(mapZod(error));
    }
  },
);

trainingRouter.post(
  '/clients/:clientId/assign-program',
  requireAuth,
  requireRole('TRAINER'),
  async (req, res, next) => {
    try {
      const body = z
        .object({
          programId: z.string().uuid(),
          startDate: z.string().datetime().or(z.string().date()),
        })
        .parse(req.body);

      const clientId = String(req.params.clientId);
      const trainerId = await trainerIdOf(req.auth!.sub);
      const client = await prisma.clientProfile.findUnique({ where: { id: clientId } });
      if (!client) throw new NotFoundError('Cliente no encontrado');
      if (client.trainerId !== trainerId) throw new ForbiddenError();

      const program = await prisma.program.findUnique({ where: { id: body.programId } });
      if (!program || program.trainerId !== trainerId) {
        throw new NotFoundError('Programa no encontrado');
      }

      const assignment = await prisma.clientProgram.create({
        data: {
          id: randomUUID(),
          clientId: client.id,
          programId: program.id,
          startDate: new Date(body.startDate),
        },
        include: { program: true },
      });

      res.status(201).json(assignment);
    } catch (error) {
      next(mapZod(error));
    }
  },
);

// Portal cliente: plan asignado
trainingRouter.get('/my-plan', requireAuth, requireRole('CLIENT'), async (req, res, next) => {
  try {
    const clientProfileId = await users.getClientProfileId(req.auth!.sub);
    if (!clientProfileId) throw new UnauthorizedError('Perfil de cliente no encontrado');

    const assignment = await prisma.clientProgram.findFirst({
      where: { clientId: clientProfileId, status: 'ACTIVE' },
      include: {
        program: {
          include: {
            workouts: {
              include: { exercises: { include: { exercise: true } } },
              orderBy: { dayIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assignment);
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
