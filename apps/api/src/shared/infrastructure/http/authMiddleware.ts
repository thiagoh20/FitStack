import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../env.js';
import { UnauthorizedError, ForbiddenError, DomainError } from '../../domain/DomainError.js';

export type AuthPayload = {
  sub: string;
  role: Role;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token requerido');
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    req.auth = payload;
    next();
  } catch (error) {
    if (error instanceof DomainError) {
      next(error);
      return;
    }
    next(new UnauthorizedError('Token inválido o expirado'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.auth.role)) {
      next(new ForbiddenError('Rol no permitido'));
      return;
    }
    next();
  };
}
