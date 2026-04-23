import { CreateMemberUseCase } from './create-member.use-case';
import { Member } from '../../domain/member.entity';
import { BusinessRuleViolation } from '../../../../shared/exceptions/domain.exception';

function makeHarness(opts: { existing: Member | null }) {
  const saved: Member[] = [];
  const members = {
    findByCode: jest.fn().mockResolvedValue(opts.existing),
    save: jest.fn(async (m: Member) => {
      saved.push(m);
      return m;
    }),
  };
  const uc = new CreateMemberUseCase(members as never);
  return { uc, members, saved };
}

describe('CreateMemberUseCase', () => {
  it('rejects creation if code already exists', async () => {
    const existing = Member.create({ code: 'M001', name: 'Angga' });
    const { uc } = makeHarness({ existing });
    await expect(uc.execute({ code: 'M001', name: 'New' })).rejects.toThrow(
      BusinessRuleViolation,
    );
  });

  it('persists a new member and returns envelope with borrowedCount=0', async () => {
    const { uc, saved } = makeHarness({ existing: null });

    const res = await uc.execute({ code: 'M004', name: 'Dedi' });

    expect(saved).toHaveLength(1);
    expect(saved[0].code).toBe('M004');
    expect(res.message).toEqual(['Member created successfully']);
    expect(res.data).toEqual({
      code: 'M004',
      name: 'Dedi',
      borrowedCount: 0,
      penalizedUntil: null,
    });
  });
});
