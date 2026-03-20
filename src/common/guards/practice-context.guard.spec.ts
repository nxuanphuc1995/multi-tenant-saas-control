import { ForbiddenException } from '@nestjs/common';
import { PracticeContextGuard } from './practice-context.guard';

function makeContext(practiceId: string, userId: string, request: Record<string, any> = {}) {
  const req = { params: { practiceId }, user: { id: userId }, ...request };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    _req: req,
  } as any;
}

describe('PracticeContextGuard — cross-practice isolation', () => {
  it('blocks a user who is not a member of the requested practice', async () => {
    const membershipRepo = { findOne: jest.fn().mockResolvedValue(null) };
    const guard = new PracticeContextGuard(membershipRepo as any);

    // user-1 is only in practice-1 but requests practice-2
    const ctx = makeContext('practice-2', 'user-1');

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(membershipRepo.findOne).toHaveBeenCalledWith({
      where: { practiceId: 'practice-2', userId: 'user-1' },
    });
  });

  it('allows access and attaches membership when the user is a member', async () => {
    const membership = { practiceId: 'practice-1', userId: 'user-1', role: 'Staff' };
    const membershipRepo = { findOne: jest.fn().mockResolvedValue(membership) };
    const guard = new PracticeContextGuard(membershipRepo as any);

    const ctx = makeContext('practice-1', 'user-1');

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(ctx._req.membership).toBe(membership);
  });

  it('blocks user-A from accessing user-B practice even when user-A has a valid token', async () => {
    // user-A (alice) is admin of practice-1 (Sunrise Dental)
    // user-A tries to read clients from practice-2 (Metro Health) — must be blocked
    const membershipRepo = {
      findOne: jest.fn().mockImplementation(({ where }) => {
        // Alice is only a member of practice-1
        if (where.practiceId === 'practice-1' && where.userId === 'alice') {
          return Promise.resolve({ practiceId: 'practice-1', userId: 'alice', role: 'PracticeAdmin' });
        }
        return Promise.resolve(null);
      }),
    };
    const guard = new PracticeContextGuard(membershipRepo as any);

    const ctx = makeContext('practice-2', 'alice');

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
