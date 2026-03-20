import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('extensions')
export class Extension {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slot: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  requiredScopes: string[];

  @Column({ type: 'jsonb', default: [] })
  visibleToRoles: string[];

  @CreateDateColumn()
  createdAt: Date;
}
