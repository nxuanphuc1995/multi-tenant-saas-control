import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Client } from './client.entity';

export enum ActorType {
  User = 'user',
  Integration = 'integration',
}

export enum AuditOutcome {
  Success = 'success',
  Failure = 'failure',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  practiceId: string;

  @Column()
  actorId: string;

  @Column({ type: 'enum', enum: ActorType })
  actorType: ActorType;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'actorId' })
  actor: User;

  @Column()
  action: string;

  @Column({ nullable: true })
  targetId: string;

  @Column({ nullable: true })
  targetType: string;

  @ManyToOne(() => Client, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'targetId' })
  target: Client;

  @Column({ type: 'enum', enum: AuditOutcome })
  outcome: AuditOutcome;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
}
