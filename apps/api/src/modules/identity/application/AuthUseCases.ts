import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { ConflictError, UnauthorizedError, DomainError } from '../../../shared/domain/DomainError.js';
import { env } from '../../../shared/infrastructure/env.js';
import { Email } from '../domain/User.js';
import type { UserRepository } from '../domain/UserRepository.js';
import type { AuthPayload } from '../../../shared/infrastructure/http/authMiddleware.js';

export class RegisterTrainerUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: { email: string; password: string; displayName: string }) {
    const email = Email.create(input.email).value;
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError('El email ya está registrado');
    }
    if (input.password.length < 8) {
      throw new DomainError('La contraseña debe tener al menos 8 caracteres');
    }
    if (!input.displayName.trim()) {
      throw new DomainError('El nombre es obligatorio');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.users.createTrainer({
      id: randomUUID(),
      email,
      passwordHash,
      displayName: input.displayName.trim(),
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  private async issueTokens(userId: string, email: string, role: Role) {
    const accessToken = jwt.sign(
      { sub: userId, email, role } satisfies AuthPayload,
      env.jwtAccessSecret,
      { expiresIn: env.jwtAccessExpiresIn } as jwt.SignOptions,
    );

    const refreshToken = jwt.sign(
      { sub: userId },
      env.jwtRefreshSecret,
      { expiresIn: env.jwtRefreshExpiresIn } as jwt.SignOptions,
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.users.saveRefreshToken({
      id: randomUUID(),
      userId,
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken, role };
  }
}

export class LoginUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: { email: string; password: string }) {
    const email = Email.create(input.email).value;
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role } satisfies AuthPayload,
      env.jwtAccessSecret,
      { expiresIn: env.jwtAccessExpiresIn } as jwt.SignOptions,
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      env.jwtRefreshSecret,
      { expiresIn: env.jwtRefreshExpiresIn } as jwt.SignOptions,
    );

    await this.users.saveRefreshToken({
      id: randomUUID(),
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken, role: user.role };
  }
}

export class GetMeUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string) {
    const me = await this.users.getMe(userId);
    if (!me) {
      throw new UnauthorizedError();
    }
    return me;
  }
}

export class RegisterClientAccountUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: {
    email: string;
    password: string;
    clientProfileId: string;
  }) {
    const email = Email.create(input.email).value;
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError('El email ya está registrado');
    }
    if (input.password.length < 8) {
      throw new DomainError('La contraseña debe tener al menos 8 caracteres');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.users.createClientUser({
      id: randomUUID(),
      email,
      passwordHash,
      clientProfileId: input.clientProfileId,
    });

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role } satisfies AuthPayload,
      env.jwtAccessSecret,
      { expiresIn: env.jwtAccessExpiresIn } as jwt.SignOptions,
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      env.jwtRefreshSecret,
      { expiresIn: env.jwtRefreshExpiresIn } as jwt.SignOptions,
    );

    await this.users.saveRefreshToken({
      id: randomUUID(),
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken, role: user.role };
  }
}
