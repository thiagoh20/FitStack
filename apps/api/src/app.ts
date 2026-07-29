import express from 'express';
import cors from 'cors';
import { env } from './shared/infrastructure/env.js';
import { errorHandler } from './shared/infrastructure/http/errorHandler.js';
import { identityRouter } from './modules/identity/presentation/identityRouter.js';
import { clientsRouter } from './modules/clients/presentation/clientsRouter.js';
import { trainingRouter } from './modules/training/presentation/trainingRouter.js';
import { progressRouter } from './modules/progress/presentation/progressRouter.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'fitstack-api' });
  });

  app.use('/auth', identityRouter);
  app.use('/clients', clientsRouter);
  app.use('/training', trainingRouter);
  app.use('/progress', progressRouter);

  app.use(errorHandler);
  return app;
}
