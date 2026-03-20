import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PracticesModule } from './practices/practices.module';
import { ClientsModule } from './clients/clients.module';
import { ActionsModule } from './actions/actions.module';
import { AuditModule } from './audit/audit.module';
import { ExtensionsModule } from './extensions/extensions.module';
import { EmailProviderModule } from './email-provider/email-provider.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { Practice } from './entities/practice.entity';
import { User } from './entities/user.entity';
import { PracticeMembership } from './entities/practice-membership.entity';
import { Client } from './entities/client.entity';
import { Integration } from './entities/integration.entity';
import { PracticeIntegration } from './entities/practice-integration.entity';
import { ActionRun } from './entities/action-run.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SentEmail } from './entities/sent-email.entity';
import { Extension } from './entities/extension.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASS || 'postgres',
      database: process.env.DATABASE_NAME || 'saas_platform',
      entities: [
        Practice,
        User,
        PracticeMembership,
        Client,
        Integration,
        PracticeIntegration,
        ActionRun,
        AuditLog,
        SentEmail,
        Extension,
      ],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    PracticesModule,
    ClientsModule,
    ActionsModule,
    AuditModule,
    ExtensionsModule,
    EmailProviderModule,
    IntegrationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
