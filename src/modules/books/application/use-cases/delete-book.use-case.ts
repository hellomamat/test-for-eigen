import { Inject, Injectable } from '@nestjs/common';
import { BOOK_REPOSITORY, BookRepository } from '../../domain/book.repository';
import {
  BORROWING_REPOSITORY,
  BorrowingRepository,
} from '../../../borrowings/domain/borrowing.repository';
import {
  BusinessRuleViolation,
  NotFoundDomainError,
} from '../../../../shared/exceptions/domain.exception';
import { ApiResponse, ok } from '../../../../shared/utils/api-response';

@Injectable()
export class DeleteBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: BookRepository,
    @Inject(BORROWING_REPOSITORY) private readonly borrowings: BorrowingRepository,
  ) {}

  async execute(code: string): Promise<ApiResponse<{ code: string }>> {
    const book = await this.books.findByCode(code);
    if (!book) {
      throw new NotFoundDomainError(`Book ${code} not found`);
    }

    const active = await this.borrowings.findActiveByBook(code);
    if (active) {
      throw new BusinessRuleViolation(
        `Book ${code} is currently borrowed by member ${active.memberCode} and cannot be deleted`,
      );
    }

    await this.books.deleteByCode(code);
    return ok({ code }, `Book ${code} deleted successfully`);
  }
}
