import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Practice } from './practice.entity';
import { User } from './user.entity';
import { Role } from '../common/roles';

@Entity('practice_memberships')
@Unique(['practiceId', 'userId'])
export class PracticeMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  practiceId: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Practice, (p) => p.memberships)
  @JoinColumn({ name: 'practiceId' })
  practice: Practice;

  @ManyToOne(() => User, (u) => u.memberships)
  @JoinColumn({ name: 'userId' })
  user: User;
}
