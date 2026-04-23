import { BorrowBookUseCase, MAX_ACTIVE_BORROWINGS } from './borrow-book.use-case';
import { Member } from '../../../members/domain/member.entity';
import { Book } from '../../../books/domain/book.entity';
import { Borrowing } from '../../domain/borrowing.entity';
import {
  BusinessRuleViolation,
  NotFoundDomainError,
} from '../../../../shared/exceptions/domain.exception';

const NOW = new Date('2026-04-21T00:00:00.000Z');

function makeUseCase(overrides: {
  member?: Member | null;
  book?: Book | null;
  activeByMember?: number;
  activeByBook?: Borrowing | null;
}) {
  const saved: Borrowing[] = [];
  const members = { findByCode: jest.fn().mockResolvedValue(overrides.member ?? null) };
  const books = { findByCode: jest.fn().mockResolvedValue(overrides.book ?? null) };
  const borrowings = {
    countActiveByMemberCode: jest.fn().mockResolvedValue(overrides.activeByMember ?? 0),
    findActiveByBook: jest.fn().mockResolvedValue(overrides.activeByBook ?? null),
    save: jest.fn(async (b: Borrowing) => {
      saved.push(b);
      return Borrowing.create({
        id: 'uuid-1',
        memberCode: b.memberCode,
        bookCode: b.bookCode,
        borrowedAt: b.borrowedAt,
        returnedAt: b.returnedAt,
      });
    }),
  };
  const clock = { now: () => NOW };
  const uc = new BorrowBookUseCase(
    members as never,
    books as never,
    borrowings as never,
    clock,
  );
  return { uc, saved, members, books, borrowings };
}

describe('BorrowBookUseCase', () => {
  it('throws if member is not found', async () => {
    const { uc } = makeUseCase({ member: null });
    await expect(uc.execute('M404', 'JK-45')).rejects.toThrow(NotFoundDomainError);
  });

  it('throws if book is not found', async () => {
    const member = Member.create({ code: 'M001', name: 'A' });
    const { uc } = makeUseCase({ member, book: null });
    await expect(uc.execute('M001', 'NOPE')).rejects.toThrow(NotFoundDomainError);
  });

  it('throws when member has 2 active borrowings already', async () => {
    const member = Member.create({ code: 'M001', name: 'A' });
    const book = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const { uc } = makeUseCase({ member, book, activeByMember: MAX_ACTIVE_BORROWINGS });
    await expect(uc.execute('M001', 'JK-45')).rejects.toThrow(BusinessRuleViolation);
  });

  it('throws when member is penalized', async () => {
    const future = new Date(NOW.getTime() + 24 * 3600 * 1000);
    const member = Member.create({ code: 'M001', name: 'A', penalizedUntil: future });
    const book = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const { uc } = makeUseCase({ member, book });
    await expect(uc.execute('M001', 'JK-45')).rejects.toThrow(BusinessRuleViolation);
  });

  it('throws when book is already borrowed by someone else', async () => {
    const member = Member.create({ code: 'M001', name: 'A' });
    const book = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const existing = Borrowing.create({
      id: 'x',
      memberCode: 'M002',
      bookCode: 'JK-45',
      borrowedAt: NOW,
    });
    const { uc } = makeUseCase({ member, book, activeByBook: existing });
    await expect(uc.execute('M001', 'JK-45')).rejects.toThrow(BusinessRuleViolation);
  });

  it('creates a borrowing on the happy path and returns envelope', async () => {
    const member = Member.create({ code: 'M001', name: 'A' });
    const book = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const { uc, saved } = makeUseCase({ member, book });
    const res = await uc.execute('M001', 'JK-45');

    expect(saved).toHaveLength(1);
    expect(res.message).toEqual(['Book borrowed successfully']);
    expect(res.data.memberCode).toBe('M001');
    expect(res.data.bookCode).toBe('JK-45');
    expect(res.data.returnedAt).toBeNull();
  });
});
