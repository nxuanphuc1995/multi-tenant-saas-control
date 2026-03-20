import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Extension } from '../entities/extension.entity';
import { PracticeMembership } from '../entities/practice-membership.entity';
import { ExtensionsController } from './extensions.controller';
import { ExtensionsService } from './extensions.service';
import { PracticeContextGuard } from '../common/guards/practice-context.guard';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Extension, PracticeMembership]),
    IntegrationsModule,
  ],
  controllers: [ExtensionsController],
  providers: [ExtensionsService, PracticeContextGuard],
})
export class ExtensionsModule {}
