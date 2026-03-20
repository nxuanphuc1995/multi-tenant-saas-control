import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Practice } from '../entities/practice.entity';
import { User } from '../entities/user.entity';
import { PracticeMembership } from '../entities/practice-membership.entity';
import { Client } from '../entities/client.entity';
import { Integration } from '../entities/integration.entity';
import { PracticeIntegration } from '../entities/practice-integration.entity';
import { Extension } from '../entities/extension.entity';
import { ActionRun } from '../entities/action-run.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { SentEmail } from '../entities/sent-email.entity';
import { Role } from '../common/roles';

const dataSource = new DataSource({
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
    Extension,
    ActionRun,
    AuditLog,
    SentEmail,
  ],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('🌱 Seeding database...');

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── Practices ──────────────────────────────────────────────
  const practiceRepo = dataSource.getRepository(Practice);
  const sunrise = practiceRepo.create({ name: 'Sunrise Dental' });
  const metro = practiceRepo.create({ name: 'Metro Health' });
  await practiceRepo.save([sunrise, metro]);
  console.log('✅ Practices created');

  // ── Users ──────────────────────────────────────────────────
  const userRepo = dataSource.getRepository(User);
  const alice = userRepo.create({
    email: 'alice@sunrise.com',
    password: await hash('password123'),
    name: 'Alice Admin',
  });
  const bob = userRepo.create({
    email: 'bob@sunrise.com',
    password: await hash('password123'),
    name: 'Bob Staff',
  });
  const carol = userRepo.create({
    email: 'carol@metro.com',
    password: await hash('password123'),
    name: 'Carol Admin',
  });
  const integrationUser = userRepo.create({
    email: 'integration@sunrise.com',
    password: await hash('password123'),
    name: 'EmailProvider Bot',
  });
  await userRepo.save([alice, bob, carol, integrationUser]);
  console.log('✅ Users created');

  // ── Memberships ────────────────────────────────────────────
  const membershipRepo = dataSource.getRepository(PracticeMembership);
  await membershipRepo.save([
    membershipRepo.create({ practiceId: sunrise.id, userId: alice.id, role: Role.PracticeAdmin }),
    membershipRepo.create({ practiceId: sunrise.id, userId: bob.id, role: Role.Staff }),
    membershipRepo.create({ practiceId: sunrise.id, userId: integrationUser.id, role: Role.Integration }),
    membershipRepo.create({ practiceId: metro.id, userId: carol.id, role: Role.PracticeAdmin }),
    membershipRepo.create({ practiceId: metro.id, userId: alice.id, role: Role.Staff }),
  ]);
  console.log('✅ Memberships created');

  // ── Clients ────────────────────────────────────────────────
  const clientRepo = dataSource.getRepository(Client);
  await clientRepo.save([
    clientRepo.create({ practiceId: sunrise.id, name: 'John Doe', email: 'john.doe@email.com' }),
    clientRepo.create({ practiceId: sunrise.id, name: 'Jane Smith', email: 'jane.smith@email.com' }),
    clientRepo.create({ practiceId: metro.id, name: 'Bob Johnson', email: 'bob.johnson@email.com' }),
  ]);
  console.log('✅ Clients created');

  // ── Integration ────────────────────────────────────────────
  const integrationRepo = dataSource.getRepository(Integration);
  const emailProvider = integrationRepo.create({
    name: 'EmailProvider',
    requiredScopes: ['client.write'],
  });
  await integrationRepo.save(emailProvider);
  console.log('✅ Integration created');

  // ── Practice Integrations ──────────────────────────────────
  const practiceIntegrationRepo = dataSource.getRepository(PracticeIntegration);
  await practiceIntegrationRepo.save([
    practiceIntegrationRepo.create({
      practiceId: sunrise.id,
      integrationId: emailProvider.id,
      enabled: true,
      approvedScopes: ['client.write', 'email.write'],
    }),
    practiceIntegrationRepo.create({
      practiceId: metro.id,
      integrationId: emailProvider.id,
      enabled: true,
      approvedScopes: ['client.write', 'email.write'],
    }),
  ]);
  console.log('✅ Practice integrations created');

  // ── Extensions ─────────────────────────────────────────────
  const extensionRepo = dataSource.getRepository(Extension);
  await extensionRepo.save([
    extensionRepo.create({
      name: 'ClientNotes',
      slot: 'client.sidepanel',
      description: 'View and add notes for the client',
      requiredScopes: ['client.write'],
      visibleToRoles: [Role.PracticeAdmin, Role.Staff],
    }),
    extensionRepo.create({
      name: 'QuickEmail',
      slot: 'client.sidepanel',
      description: 'Send a quick email to the client',
      requiredScopes: ['email.write'],
      visibleToRoles: [Role.PracticeAdmin, Role.Integration],
    }),
    extensionRepo.create({
      name: 'BillingWidget',
      slot: 'client.sidepanel',
      description: 'View billing summary (requires billing.read scope)',
      requiredScopes: ['billing.read'],
      visibleToRoles: [Role.PracticeAdmin],
    }),
  ]);
  console.log('✅ Extensions created');

  await dataSource.destroy();
  console.log('\n🎉 Seed complete!');
  console.log('\nSeed accounts (password: password123):');
  console.log('  alice@sunrise.com       → PracticeAdmin @ Sunrise Dental');
  console.log('  alice@sunrise.com       → Staff @ Metro Health');
  console.log('  bob@sunrise.com         → Staff @ Sunrise Dental');
  console.log('  carol@metro.com         → PracticeAdmin @ Metro Health');
  console.log('  integration@sunrise.com → Integration @ Sunrise Dental');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
