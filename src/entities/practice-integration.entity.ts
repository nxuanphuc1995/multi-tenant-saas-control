import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Practice } from './practice.entity';
import { Integration } from './integration.entity';

@Entity('practice_integrations')
@Unique(['practiceId', 'integrationId'])
export class PracticeIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  practiceId: string;

  @Column()
  integrationId: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'jsonb', default: [] })
  approvedScopes: string[];

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Practice, (p) => p.practiceIntegrations)
  @JoinColumn({ name: 'practiceId' })
  practice: Practice;

  @ManyToOne(() => Integration)
  @JoinColumn({ name: 'integrationId' })
  integration: Integration;
}
