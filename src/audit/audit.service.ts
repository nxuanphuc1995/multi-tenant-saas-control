import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, ActorType, AuditOutcome } from '../entities/audit-log.entity';

export interface CreateAuditEntry {
  practiceId: string;
  actorId: string;
  actorType: ActorType;
  action: string;
  targetId?: string;
  targetType?: string;
  outcome: AuditOutcome;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  log(entry: CreateAuditEntry) {
    const record = this.auditRepo.create(entry);
    return this.auditRepo.save(record);
  }

  async findByPractice(practiceId: string) {
    const logs = await this.auditRepo.find({
      where: { practiceId },
      order: { timestamp: 'DESC' },
    });

    return logs.map((log) => ({
      id: log.id,
      practiceId: log.practiceId,
      actor: {
        id: log.actorId,
        name: log.actor?.name ?? 'Unknown',
        type: log.actorType,
      },
      action: log.action,
      target: {
        id: log.targetId,
        name: log.target?.name ?? null,
        type: log.targetType,
      },
      outcome: log.outcome,
      timestamp: log.timestamp,
      metadata: log.metadata,
    }));
  }
}
