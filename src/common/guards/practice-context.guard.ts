import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeMembership } from '../../entities/practice-membership.entity';

@Injectable()
export class PracticeContextGuard implements CanActivate {
  constructor(
    @InjectRepository(PracticeMembership)
    private membershipRepo: Repository<PracticeMembership>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { practiceId } = request.params;
    const user = request.user;

    if (!practiceId) return true;
    if (!user) return false;

    const membership = await this.membershipRepo.findOne({
      where: { practiceId, userId: user.id },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this practice');
    }

    request.membership = membership;
    return true;
  }
}
