import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeIntegration } from '../entities/practice-integration.entity';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(PracticeIntegration)
    private practiceIntegrationRepo: Repository<PracticeIntegration>,
  ) {}

  async hasScopesApproved(
    practiceId: string,
    requiredScopes: string[],
  ): Promise<boolean> {
    const integrations = await this.practiceIntegrationRepo.find({
      where: { practiceId, enabled: true },
    });
    const allApproved = integrations.flatMap((i) =>
      (i.approvedScopes ?? []).filter((s) => s.length > 0),
    );
    return requiredScopes.every((s) => allApproved.includes(s));
  }

  findByPractice(practiceId: string) {
    return this.practiceIntegrationRepo.find({
      where: { practiceId },
      relations: ['integration'],
    });
  }
}
