import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sent_emails')
export class SentEmail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  practiceId: string;

  @Column({ nullable: true })
  clientId: string;

  @Column()
  to: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn()
  timestamp: Date;
}
