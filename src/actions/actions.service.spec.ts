import { ForbiddenException } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionStatus } from '../entities/action-run.entity';
import { Role } from '../common/roles';
import { ActorType, AuditOutcome } from '../entities/audit-log.entity';

function buildService(overrides: Partial<{
  existingRun: any;
  client: any;
  scopesApproved: boolean;
  sentEmail: any;
}> = {}) {
  const {
    existingRun = null,
    client = { id: 'client-1', practiceId: 'practice-1' },
    scopesApproved = true,
    sentEmail = { id: 'email-1' },
  } = overrides;

  const savedRun = { id: 'run-1', status: ActionStatus.Success, result: { sentEmailId: 'email-1' } };

  const actionRunRepo = {
    findOne: jest.fn().mockResolvedValue(existingRun),
    create: jest.fn().mockImplementation((d) => d),
    save: jest.fn().mockResolvedValue(savedRun),
  };
  const emailProvider = { send: jest.fn().mockResolvedValue(sentEmail) };
  const integrationsService = { hasScopesApproved: jest.fn().mockResolvedValue(scopesApproved) };
  const auditService = { log: jest.fn().mockResolvedValue({}) };
  const clientsService = { findOne: jest.fn().mockResolvedValue(client) };

  const service = new ActionsService(
    actionRunRepo as any,
    emailProvider as any,
    integrationsService as any,
    auditService as any,
    clientsService as any,
  );

  return { service, actionRunRepo, emailProvider, integrationsService, auditService };
}

const adminMembership = { userId: 'user-1', practiceId: 'practice-1', role: Role.PracticeAdmin };

const validDto = {
  type: 'email.send',
  client_id: 'client-1',
  to: 'recipient@example.com',
  subject: 'Hello',
  body: 'World',
  idempotency_key: 'key-abc',
};

// ── Test 2a: action blocked when required scope is not approved ─────────────
describe('ActionsService — action blocked when scope is not approved', () => {
  it('throws ForbiddenException when client.write scope is not approved for the practice', async () => {
    const { service } = buildService({ scopesApproved: false });

    await expect(
      service.execute('practice-1', adminMembership as any, validDto),
    ).rejects.toThrow(ForbiddenException);
  });

  it('does NOT call EmailProvider when scope is missing', async () => {
    const { service, emailProvider } = buildService({ scopesApproved: false });

    await expect(
      service.execute('practice-1', adminMembership as any, validDto),
    ).rejects.toThrow();

    expect(emailProvider.send).not.toHaveBeenCalled();
  });

  it('does NOT write an audit entry when scope check fails', async () => {
    const { service, auditService } = buildService({ scopesApproved: false });

    await expect(
      service.execute('practice-1', adminMembership as any, validDto),
    ).rejects.toThrow();

    expect(auditService.log).not.toHaveBeenCalled();
  });
});

// ── Test 2b: action succeeds when all checks pass ──────────────────────────
describe('ActionsService — action executes successfully', () => {
  it('calls EmailProvider and writes an audit log on success', async () => {
    const { service, emailProvider, auditService } = buildService();

    const result = await service.execute('practice-1', adminMembership as any, validDto);

    expect(result.idempotent).toBe(false);
    expect(emailProvider.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'recipient@example.com', practiceId: 'practice-1' }),
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: AuditOutcome.Success, action: 'email.send' }),
    );
  });

  it('returns idempotent: true without re-executing when key already exists', async () => {
    const existingRun = { id: 'run-existing', status: ActionStatus.Success };
    const { service, emailProvider } = buildService({ existingRun });

    const result = await service.execute('practice-1', adminMembership as any, validDto);

    expect(result.idempotent).toBe(true);
    expect(result.actionRun).toBe(existingRun);
    expect(emailProvider.send).not.toHaveBeenCalled();
  });

  it('records actor type as Integration when membership role is Integration', async () => {
    const { service, auditService } = buildService();
    const integrationMembership = { ...adminMembership, role: Role.Integration };

    await service.execute('practice-1', integrationMembership as any, validDto);

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ actorType: ActorType.Integration }),
    );
  });
});
