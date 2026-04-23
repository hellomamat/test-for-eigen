import { GetMembersUseCase } from './get-members.use-case';
import { Member } from '../../domain/member.entity';

describe('GetMembersUseCase', () => {
  it('returns each member with their active borrow count', async () => {
    const penalizedUntil = new Date('2026-05-01T00:00:00.000Z');
    const members = {
      findAll: jest.fn().mockResolvedValue([
        Member.create({ code: 'M001', name: 'Angga' }),
        Member.create({ code: 'M002', name: 'Ferry', penalizedUntil }),
      ]),
    };
    const borrowings = {
      countActiveByMember: jest.fn().mockResolvedValue(new Map([['M001', 2]])),
    };
    const uc = new GetMembersUseCase(members as never, borrowings as never);

    const res = await uc.execute();

    expect(res).toEqual({
      message: ['Members retrieved successfully'],
      data: [
        { code: 'M001', name: 'Angga', borrowedCount: 2, penalizedUntil: null },
        {
          code: 'M002',
          name: 'Ferry',
          borrowedCount: 0,
          penalizedUntil: penalizedUntil.toISOString(),
        },
      ],
    });
  });

  it('passes the search term to the repository', async () => {
    const members = {
      findAll: jest.fn().mockResolvedValue([Member.create({ code: 'M001', name: 'Angga' })]),
    };
    const borrowings = { countActiveByMember: jest.fn().mockResolvedValue(new Map()) };
    const uc = new GetMembersUseCase(members as never, borrowings as never);

    await uc.execute({ search: 'Angga' });

    expect(members.findAll).toHaveBeenCalledWith({ search: 'Angga' });
  });
});
