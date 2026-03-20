import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionRun } from '../entities/action-run.entity';
import { PracticeMembership } from '../entities/practice-membership.entity';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { PracticeContextGuard } from '../common/guards/practice-context.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { EmailProviderModule } from '../email-provider/email-provider.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { AuditModule } from '../audit/audit.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActionRun, PracticeMembership]),
    EmailProviderModule,
    IntegrationsModule,
    AuditModule,
    ClientsModule,
  ],
  controllers: [ActionsController],
  providers: [ActionsService, PracticeContextGuard, PermissionsGuard],
})
export class ActionsModule {}
