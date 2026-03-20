import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PracticeContextGuard } from '../common/guards/practice-context.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@Controller('practices/:practiceId/audit')
@UseGuards(PracticeContextGuard, PermissionsGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @RequirePermissions('read:audit')
  findAll(@Param('practiceId') practiceId: string) {
    return this.auditService.findByPractice(practiceId);
  }
}
