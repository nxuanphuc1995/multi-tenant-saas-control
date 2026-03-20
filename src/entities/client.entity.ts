import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Practice } from './practice.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  practiceId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Practice, (p) => p.clients)
  @JoinColumn({ name: 'practiceId' })
  practice: Practice;
}
