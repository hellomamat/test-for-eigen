import { DeleteMemberUseCase } from './delete-member.use-case';
import { Member } from '../../domain/member.entity';
import {
  BusinessRuleViolation,
  NotFoundDomainError,
} from '../../../../shared/exceptions/domain.exception';

function makeHarness(opts: { member: Member | null; activeCount?: number }) {
  const deleted: string[] = [];
  const members = {
    findByCode: jest.fn().mockResolvedValue(opts.member),
    deleteByCode: jest.fn(async (code: string) => {
      deleted.push(code);
    }),
  };
  const borrowings = {
    countActiveByMemberCode: jest.fn().mockResolvedValue(opts.activeCount ?? 0),
  };
  const uc = new DeleteMemberUseCase(members as never, borrowings as never);
  return { uc, members, borrowings, deleted };
}

describe('DeleteMemberUseCase', () => {
  it('throws NotFoundDomainError when member does not exist', async () => {
    const { uc } = makeHarness({ member: null });
    await expect(uc.execute('M404')).rejects.toThrow(NotFoundDomainError);
  });

  it('refuses deletion when member still has active borrowings', async () => {
    const member = Member.create({ code: 'M001', name: 'Angga' });
    const { uc, deleted } = makeHarness({ member, activeCount: 2 });
    await expect(uc.execute('M001')).rejects.toThrow(BusinessRuleViolation);
    expect(deleted).toHaveLength(0);
  });

  it('deletes the member when there are no active borrowings', async () => {
    const member = Member.create({ code: 'M002', name: 'Ferry' });
    const { uc, deleted } = makeHarness({ member, activeCount: 0 });

    const res = await uc.execute('M002');

    expect(deleted).toEqual(['M002']);
    expect(res.data).toEqual({ code: 'M002' });
    expect(res.message[0]).toContain('deleted');
  });
});
