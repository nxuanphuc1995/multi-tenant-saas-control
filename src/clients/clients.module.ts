import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../entities/client.entity';
import { PracticeMembership } from '../entities/practice-membership.entity';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { PracticeContextGuard } from '../common/guards/practice-context.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Client, PracticeMembership])],
  controllers: [ClientsController],
  providers: [ClientsService, PracticeContextGuard, PermissionsGuard],
  exports: [ClientsService],
})
export class ClientsModule {}
