import { GetMemberByCodeUseCase } from './get-member-by-code.use-case';
import { Member } from '../../domain/member.entity';
import { Book } from '../../../books/domain/book.entity';
import { Borrowing } from '../../../borrowings/domain/borrowing.entity';
import { NotFoundDomainError } from '../../../../shared/exceptions/domain.exception';

const NOW = new Date('2026-04-20T00:00:00.000Z');
const daysBefore = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

function makeHarness(opts: {
  member: Member | null;
  borrowings?: Borrowing[];
  books?: Book[];
}) {
  const members = { findByCode: jest.fn().mockResolvedValue(opts.member) };
  const bookMap = new Map((opts.books ?? []).map((b) => [b.code, b]));
  const books = {
    findByCode: jest.fn(async (code: string) => bookMap.get(code) ?? null),
  };
  const borrowings = {
    findActiveByMember: jest.fn().mockResolvedValue(opts.borrowings ?? []),
  };
  const clock = { now: () => NOW };
  const uc = new GetMemberByCodeUseCase(
    members as never,
    books as never,
    borrowings as never,
    clock,
  );
  return { uc, members, books, borrowings };
}

describe('GetMemberByCodeUseCase', () => {
  it('throws NotFoundDomainError when member does not exist', async () => {
    const { uc } = makeHarness({ member: null });
    await expect(uc.execute('M404')).rejects.toThrow(NotFoundDomainError);
  });

  it('returns member with empty borrowings when none are active', async () => {
    const member = Member.create({ code: 'M001', name: 'Angga' });
    const { uc } = makeHarness({ member, borrowings: [] });

    const res = await uc.execute('M001');

    expect(res.message).toEqual(['Member retrieved successfully']);
    expect(res.data).toEqual({
      code: 'M001',
      name: 'Angga',
      penalizedUntil: null,
      borrowings: [],
    });
  });

  it('joins each active borrowing with its book and computes days + overdue', async () => {
    const member = Member.create({ code: 'M001', name: 'Angga' });
    const hp = Book.create({ code: 'JK-45', title: 'Harry Potter', author: 'JKR', stock: 1 });
    const tw = Book.create({ code: 'TW-11', title: 'Twilight', author: 'SM', stock: 1 });
    const b1 = Borrowing.create({
      id: 'b1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt: daysBefore(3), // within 7 days
    });
    const b2 = Borrowing.create({
      id: 'b2',
      memberCode: 'M001',
      bookCode: 'TW-11',
      borrowedAt: daysBefore(9), // overdue
    });
    const { uc } = makeHarness({ member, borrowings: [b1, b2], books: [hp, tw] });

    const res = await uc.execute('M001');

    expect(res.data.borrowings).toHaveLength(2);
    expect(res.data.borrowings[0]).toMatchObject({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'JKR',
      daysBorrowed: 3,
      isOverdue: false,
    });
    expect(res.data.borrowings[1]).toMatchObject({
      code: 'TW-11',
      title: 'Twilight',
      author: 'SM',
      daysBorrowed: 9,
      isOverdue: true,
    });
  });
});
