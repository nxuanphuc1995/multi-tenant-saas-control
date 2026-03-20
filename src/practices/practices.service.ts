import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Practice } from '../entities/practice.entity';
import { PracticeMembership } from '../entities/practice-membership.entity';

@Injectable()
export class PracticesService {
  constructor(
    @InjectRepository(Practice)
    private practiceRepo: Repository<Practice>,
    @InjectRepository(PracticeMembership)
    private membershipRepo: Repository<PracticeMembership>,
  ) {}

  async findByUser(userId: string) {
    const memberships = await this.membershipRepo.find({
      where: { userId },
      relations: ['practice'],
    });
    return memberships.map((m) => ({
      ...m.practice,
      role: m.role,
    }));
  }

  findById(id: string) {
    return this.practiceRepo.findOne({ where: { id } });
  }
}
