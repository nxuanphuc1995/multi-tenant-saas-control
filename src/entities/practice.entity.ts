import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PracticeMembership } from './practice-membership.entity';
import { Client } from './client.entity';
import { PracticeIntegration } from './practice-integration.entity';

@Entity('practices')
export class Practice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => PracticeMembership, (m) => m.practice)
  memberships: PracticeMembership[];

  @OneToMany(() => Client, (c) => c.practice)
  clients: Client[];

  @OneToMany(() => PracticeIntegration, (pi) => pi.practice)
  practiceIntegrations: PracticeIntegration[];
}
