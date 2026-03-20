import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentEmail } from '../entities/sent-email.entity';
import { EmailProviderService } from './email-provider.service';

@Module({
  imports: [TypeOrmModule.forFeature([SentEmail])],
  providers: [EmailProviderService],
  exports: [EmailProviderService],
})
export class EmailProviderModule {}
