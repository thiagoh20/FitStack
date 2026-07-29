import { Role } from '@prisma/client';

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const value = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('Email inválido');
    }
    return new Email(value);
  }
}

export type UserProps = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
};

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  get id() {
    return this.props.id;
  }

  get email() {
    return this.props.email;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get role() {
    return this.props.role;
  }

  isTrainer() {
    return this.props.role === Role.TRAINER;
  }

  isClient() {
    return this.props.role === Role.CLIENT;
  }
}
