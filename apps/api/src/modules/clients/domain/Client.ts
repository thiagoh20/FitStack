import { ClientStatus } from '@prisma/client';
import { DomainError } from '../../../shared/domain/DomainError.js';

export type ClientProps = {
  id: string;
  trainerId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  goals: string | null;
  injuries: string | null;
  notes: string | null;
  status: ClientStatus;
};

export class Client {
  private constructor(private props: ClientProps) {}

  static create(props: ClientProps): Client {
    if (!props.fullName.trim()) {
      throw new DomainError('El nombre del cliente es obligatorio');
    }
    return new Client({
      ...props,
      fullName: props.fullName.trim(),
    });
  }

  get id() {
    return this.props.id;
  }

  get trainerId() {
    return this.props.trainerId;
  }

  get fullName() {
    return this.props.fullName;
  }

  get email() {
    return this.props.email;
  }

  get phone() {
    return this.props.phone;
  }

  get goals() {
    return this.props.goals;
  }

  get injuries() {
    return this.props.injuries;
  }

  get notes() {
    return this.props.notes;
  }

  get status() {
    return this.props.status;
  }

  belongsToTrainer(trainerId: string) {
    return this.props.trainerId === trainerId;
  }

  archive() {
    this.props.status = ClientStatus.ARCHIVED;
  }

  toJSON() {
    return { ...this.props };
  }
}
