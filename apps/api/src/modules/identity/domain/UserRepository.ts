import type { User } from './User.js';
import type { Role } from '@prisma/client';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  createTrainer(input: {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
  }): Promise<User>;
  createClientUser(input: {
    id: string;
    email: string;
    passwordHash: string;
    clientProfileId: string;
  }): Promise<User>;
  saveRefreshToken(input: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<void>;
  findRefreshToken(token: string): Promise<{ userId: string; expiresAt: Date } | null>;
  deleteRefreshToken(token: string): Promise<void>;
  getTrainerProfileId(userId: string): Promise<string | null>;
  getClientProfileId(userId: string): Promise<string | null>;
  getMe(userId: string): Promise<{
    id: string;
    email: string;
    role: Role;
    trainerProfile: { id: string; displayName: string; specialty: string | null } | null;
    clientProfile: { id: string; fullName: string; trainerId: string } | null;
  } | null>;
}
