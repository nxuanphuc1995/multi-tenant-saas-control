import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { PracticeMembership } from '../entities/practice-membership.entity';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { PracticeContextGuard } from '../common/guards/practice-context.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, PracticeMembership])],
  controllers: [AuditController],
  providers: [AuditService, PracticeContextGuard],
  exports: [AuditService],
})
export class AuditModule {}
