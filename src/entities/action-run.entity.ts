import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

export enum ActionStatus {
  Success = 'success',
  Failure = 'failure',
}

@Entity('action_runs')
@Unique(['practiceId', 'idempotencyKey'])
export class ActionRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  practiceId: string;

  @Column()
  idempotencyKey: string;

  @Column()
  actionType: string;

  @Column()
  actorId: string;

  @Column({ nullable: true })
  clientId: string;

  @Column({ type: 'enum', enum: ActionStatus })
  status: ActionStatus;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
