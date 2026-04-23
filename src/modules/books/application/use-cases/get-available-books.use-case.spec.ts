import { GetAvailableBooksUseCase } from './get-available-books.use-case';
import { Book } from '../../domain/book.entity';

function makeUseCase(opts: {
  filteredBooks?: Book[];
  total?: number;
  activeCounts?: Map<string, number>;
}) {
  const books = {
    findAll: jest.fn().mockResolvedValue(opts.filteredBooks ?? []),
    count: jest.fn().mockResolvedValue(opts.total ?? 0),
  };
  const borrowings = {
    countActiveByBook: jest.fn().mockResolvedValue(opts.activeCounts ?? new Map()),
  };
  const uc = new GetAvailableBooksUseCase(books as never, borrowings as never);
  return { uc, books, borrowings };
}

describe('GetAvailableBooksUseCase', () => {
  it('pushes search, available, and pagination (skip/take) down to the repo', async () => {
    const { uc, books } = makeUseCase({});
    await uc.execute({ page: 3, take: 5, search: 'potter', available: true });

    expect(books.findAll).toHaveBeenCalledWith({
      search: 'potter',
      available: true,
      skip: 10, // (3 - 1) * 5
      take: 5,
    });
    expect(books.count).toHaveBeenCalledWith({
      search: 'potter',
      available: true,
    });
  });

  it('uses defaults (page=1, take=10) when no params', async () => {
    const { uc, books } = makeUseCase({});
    await uc.execute();

    expect(books.findAll).toHaveBeenCalledWith({
      search: undefined,
      available: undefined,
      skip: 0,
      take: 10,
    });
  });

  it('builds paginated envelope with total from count() and computed availability', async () => {
    const hp = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    const tw = Book.create({ code: 'TW-11', title: 'Twilight', author: 'SM', stock: 1 });
    const { uc } = makeUseCase({
      filteredBooks: [hp, tw],
      total: 12, // total across all pages
      activeCounts: new Map([['JK-45', 1]]),
    });

    const res = await uc.execute({ page: 1, take: 2 });

    expect(res.message).toEqual(['Books retrieved successfully']);
    expect(res.meta).toEqual({ page: 1, take: 2, total: 12, totalPages: 6 });
    expect(res.data).toEqual([
      { code: 'JK-45', title: 'HP', author: 'JKR', stock: 1, available: 0 },
      { code: 'TW-11', title: 'Twilight', author: 'SM', stock: 1, available: 1 },
    ]);
  });
});
