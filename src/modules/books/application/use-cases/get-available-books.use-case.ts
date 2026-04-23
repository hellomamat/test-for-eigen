import { Inject, Injectable } from '@nestjs/common';
import { BOOK_REPOSITORY, BookRepository } from '../../domain/book.repository';
import {
  BORROWING_REPOSITORY,
  BorrowingRepository,
} from '../../../borrowings/domain/borrowing.repository';
import { BookAvailabilityDto } from '../dto/book-availability.dto';
import { GetBookDto } from '../dto/book-repository.dto';
import {
  ApiResponse,
  buildPaginationMeta,
  paginated,
} from '../../../../shared/utils/api-response';

@Injectable()
export class GetAvailableBooksUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: BookRepository,
    @Inject(BORROWING_REPOSITORY) private readonly borrowings: BorrowingRepository,
  ) {}

  async execute(params: GetBookDto = {}): Promise<ApiResponse<BookAvailabilityDto[]>> {
    const page = params.page ?? 1;
    const take = params.take ?? 10;
    const skip = (page - 1) * take;

    const filterOptions = { search: params.search, available: params.available };

    const [books, total, activeCounts] = await Promise.all([
      this.books.findAll({ ...filterOptions, skip, take }),
      this.books.count(filterOptions),
      this.borrowings.countActiveByBook(),
    ]);

    const data: BookAvailabilityDto[] = books.map((book) => ({
      code: book.code,
      title: book.title,
      author: book.author,
      stock: book.stock,
      available: book.availableQuantity(activeCounts.get(book.code) ?? 0),
    }));

    return paginated(
      data,
      buildPaginationMeta(page, take, total),
      'Books retrieved successfully',
    );
  }
}
