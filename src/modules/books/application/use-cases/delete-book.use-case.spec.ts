import { DeleteBookUseCase } from './delete-book.use-case';
import { Book } from '../../domain/book.entity';
import { Borrowing } from '../../../borrowings/domain/borrowing.entity';
import {
  BusinessRuleViolation,
  NotFoundDomainError,
} from '../../../../shared/exceptions/domain.exception';

function makeHarness(opts: { book: Book | null; activeBorrowing?: Borrowing | null }) {
  const deleted: string[] = [];
  const books = {
    findByCode: jest.fn().mockResolvedValue(opts.book),
    deleteByCode: jest.fn(async (code: string) => {
      deleted.push(code);
    }),
  };
  const borrowings = {
    findActiveByBook: jest.fn().mockResolvedValue(opts.activeBorrowing ?? null),
  };
  const uc = new DeleteBookUseCase(books as never, borrowings as never);
  return { uc, books, borrowings, deleted };
}

describe('DeleteBookUseCase', () => {
  it('throws NotFoundDomainError when book does not exist', async () => {
    const { uc } = makeHarness({ book: null });
    await expect(uc.execute('JK-999')).rejects.toThrow(NotFoundDomainError);
  });

  it('refuses deletion when the book is currently borrowed', async () => {
    const book = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const activeBorrowing = Borrowing.create({
      id: 'b1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt: new Date(),
    });
    const { uc, deleted } = makeHarness({ book, activeBorrowing });

    await expect(uc.execute('JK-45')).rejects.toThrow(BusinessRuleViolation);
    expect(deleted).toHaveLength(0);
  });

  it('deletes the book when it is not currently borrowed', async () => {
    const book = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const { uc, deleted } = makeHarness({ book, activeBorrowing: null });

    const res = await uc.execute('JK-45');

    expect(deleted).toEqual(['JK-45']);
    expect(res.data).toEqual({ code: 'JK-45' });
    expect(res.message[0]).toContain('deleted');
  });
});
