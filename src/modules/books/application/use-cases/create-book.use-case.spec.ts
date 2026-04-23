import { CreateBookUseCase } from './create-book.use-case';
import { Book } from '../../domain/book.entity';
import { BusinessRuleViolation } from '../../../../shared/exceptions/domain.exception';

function makeHarness(opts: { existing: Book | null }) {
  const saved: Book[] = [];
  const books = {
    findByCode: jest.fn().mockResolvedValue(opts.existing),
    save: jest.fn(async (b: Book) => {
      saved.push(b);
      return b;
    }),
  };
  const uc = new CreateBookUseCase(books as never);
  return { uc, books, saved };
}

describe('CreateBookUseCase', () => {
  it('rejects creation if book code already exists', async () => {
    const existing = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const { uc } = makeHarness({ existing });
    await expect(
      uc.execute({ code: 'JK-45', title: 'Dup', author: 'X', stock: 1 }),
    ).rejects.toThrow(BusinessRuleViolation);
  });

  it('persists a new book and reports availability equal to stock', async () => {
    const { uc, saved } = makeHarness({ existing: null });

    const res = await uc.execute({
      code: 'JK-46',
      title: 'HP2',
      author: 'JKR',
      stock: 2,
    });

    expect(saved).toHaveLength(1);
    expect(res.message).toEqual(['Book created successfully']);
    expect(res.data).toEqual({
      code: 'JK-46',
      title: 'HP2',
      author: 'JKR',
      stock: 2,
      available: 2,
    });
  });
});
