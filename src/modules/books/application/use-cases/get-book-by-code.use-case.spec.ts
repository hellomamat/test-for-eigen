import { GetBookByCodeUseCase } from './get-book-by-code.use-case';
import { Book } from '../../domain/book.entity';
import { Member } from '../../../members/domain/member.entity';
import { Borrowing } from '../../../borrowings/domain/borrowing.entity';
import { NotFoundDomainError } from '../../../../shared/exceptions/domain.exception';

const NOW = new Date('2026-04-20T00:00:00.000Z');
const daysBefore = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

function makeHarness(opts: {
  book: Book | null;
  activeBorrowing?: Borrowing | null;
  member?: Member | null;
}) {
  const books = { findByCode: jest.fn().mockResolvedValue(opts.book) };
  const members = { findByCode: jest.fn().mockResolvedValue(opts.member ?? null) };
  const borrowings = {
    findActiveByBook: jest.fn().mockResolvedValue(opts.activeBorrowing ?? null),
  };
  const clock = { now: () => NOW };
  const uc = new GetBookByCodeUseCase(
    books as never,
    members as never,
    borrowings as never,
    clock,
  );
  return { uc, books, members, borrowings };
}

describe('GetBookByCodeUseCase', () => {
  it('throws NotFoundDomainError when book does not exist', async () => {
    const { uc } = makeHarness({ book: null });
    await expect(uc.execute('JK-999')).rejects.toThrow(NotFoundDomainError);
  });

  it('returns book with currentBorrowing=null when not borrowed', async () => {
    const book = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const { uc } = makeHarness({ book, activeBorrowing: null });

    const res = await uc.execute('JK-45');

    expect(res.message).toEqual(['Book retrieved successfully']);
    expect(res.data).toEqual({
      code: 'JK-45',
      title: 'HP',
      author: 'JKR',
      stock: 1,
      available: 1,
      currentBorrowing: null,
    });
  });

  it('includes borrower info, dueAt, and isOverdue=false when within 7 days', async () => {
    const book = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const member = Member.create({ code: 'M001', name: 'Angga' });
    const borrowedAt = daysBefore(3);
    const borrowing = Borrowing.create({
      id: 'b1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt,
    });
    const { uc } = makeHarness({ book, activeBorrowing: borrowing, member });

    const res = await uc.execute('JK-45');

    const expectedDue = new Date(borrowedAt);
    expectedDue.setDate(expectedDue.getDate() + 7);

    expect(res.data.available).toBe(0);
    expect(res.data.currentBorrowing).toEqual({
      memberCode: 'M001',
      memberName: 'Angga',
      borrowedAt: borrowedAt.toISOString(),
      dueAt: expectedDue.toISOString(),
      daysBorrowed: 3,
      isOverdue: false,
    });
  });

  it('marks isOverdue=true when borrowed more than 7 days ago', async () => {
    const book = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const member = Member.create({ code: 'M001', name: 'Angga' });
    const borrowing = Borrowing.create({
      id: 'b1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt: daysBefore(9),
    });
    const { uc } = makeHarness({ book, activeBorrowing: borrowing, member });

    const res = await uc.execute('JK-45');

    expect(res.data.currentBorrowing?.daysBorrowed).toBe(9);
    expect(res.data.currentBorrowing?.isOverdue).toBe(true);
  });
});
