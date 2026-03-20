import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Practice } from '../entities/practice.entity';
import { PracticeMembership } from '../entities/practice-membership.entity';
import { PracticesController } from './practices.controller';
import { PracticesService } from './practices.service';

@Module({
  imports: [TypeOrmModule.forFeature([Practice, PracticeMembership])],
  controllers: [PracticesController],
  providers: [PracticesService],
  exports: [PracticesService],
})
export class PracticesModule {}
