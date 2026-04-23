import { ReturnBookUseCase, PENALTY_DAYS } from './return-book.use-case';
import { Member } from '../../../members/domain/member.entity';
import { Borrowing } from '../../domain/borrowing.entity';
import { NotFoundDomainError } from '../../../../shared/exceptions/domain.exception';

const borrowedAt = new Date('2026-04-01T00:00:00.000Z');
const daysLater = (n: number) => new Date(borrowedAt.getTime() + n * 24 * 60 * 60 * 1000);

function makeHarness(opts: {
  member: Member | null;
  borrowing: Borrowing | null;
  now: Date;
}) {
  const savedMembers: Member[] = [];
  const savedBorrowings: Borrowing[] = [];
  const members = {
    findByCode: jest.fn().mockResolvedValue(opts.member),
    save: jest.fn(async (m: Member) => {
      savedMembers.push(m);
      return m;
    }),
  };
  const borrowings = {
    findActiveByMemberAndBook: jest.fn().mockResolvedValue(opts.borrowing),
    save: jest.fn(async (b: Borrowing) => {
      savedBorrowings.push(b);
      return b;
    }),
  };
  const clock = { now: () => opts.now };
  const uc = new ReturnBookUseCase(members as never, borrowings as never, clock);
  return { uc, savedMembers, savedBorrowings, members, borrowings };
}

describe('ReturnBookUseCase', () => {
  it('throws if member is not found', async () => {
    const { uc } = makeHarness({ member: null, borrowing: null, now: daysLater(3) });
    await expect(uc.execute('M404', 'JK-45')).rejects.toThrow(NotFoundDomainError);
  });

  it('throws if there is no active borrowing for this member+book', async () => {
    const member = Member.create({ code: 'M001', name: 'A' });
    const { uc } = makeHarness({ member, borrowing: null, now: daysLater(3) });
    await expect(uc.execute('M001', 'JK-45')).rejects.toThrow(NotFoundDomainError);
  });

  it('returns the book without penalty when within 7 days', async () => {
    const member = Member.create({ code: 'M001', name: 'A' });
    const b = Borrowing.create({
      id: 'id-1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt,
    });
    const { uc, savedMembers } = makeHarness({ member, borrowing: b, now: daysLater(5) });

    const res = await uc.execute('M001', 'JK-45');

    expect(res.message).toEqual(['Book returned successfully']);
    expect(res.data.penaltyApplied).toBe(false);
    expect(res.data.penalizedUntil).toBeNull();
    expect(savedMembers).toHaveLength(0); // member is not updated when no penalty
    expect(res.data.returnedAt).not.toBeNull();
  });

  it('penalizes the member when returned after more than 7 days', async () => {
    const member = Member.create({ code: 'M001', name: 'A' });
    const b = Borrowing.create({
      id: 'id-1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt,
    });
    const now = daysLater(9);
    const { uc, savedMembers } = makeHarness({ member, borrowing: b, now });

    const res = await uc.execute('M001', 'JK-45');

    expect(res.message).toEqual(['Book returned with penalty']);
    expect(res.data.penaltyApplied).toBe(true);
    expect(savedMembers).toHaveLength(1);

    const expectedUntil = new Date(now);
    expectedUntil.setDate(expectedUntil.getDate() + PENALTY_DAYS);
    expect(res.data.penalizedUntil).toBe(expectedUntil.toISOString());
  });
});
