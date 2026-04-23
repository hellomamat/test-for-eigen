import { Inject, Injectable } from '@nestjs/common';
import { BOOK_REPOSITORY, BookRepository } from '../../domain/book.repository';
import {
  MEMBER_REPOSITORY,
  MemberRepository,
} from '../../../members/domain/member.repository';
import {
  BORROWING_REPOSITORY,
  BorrowingRepository,
} from '../../../borrowings/domain/borrowing.repository';
import { NotFoundDomainError } from '../../../../shared/exceptions/domain.exception';
import { CLOCK, Clock } from '../../../../shared/clock';
import { BookDetailDto } from '../dto/book-detail.dto';
import { ApiResponse, ok } from '../../../../shared/utils/api-response';

@Injectable()
export class GetBookByCodeUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: BookRepository,
    @Inject(MEMBER_REPOSITORY) private readonly members: MemberRepository,
    @Inject(BORROWING_REPOSITORY) private readonly borrowings: BorrowingRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(code: string): Promise<ApiResponse<BookDetailDto>> {
    const book = await this.books.findByCode(code);
    if (!book) throw new NotFoundDomainError(`Book ${code} not found`);

    const activeBorrowing = await this.borrowings.findActiveByBook(code);

    if (!activeBorrowing) {
      return ok(
        {
          code: book.code,
          title: book.title,
          author: book.author,
          stock: book.stock,
          available: book.availableQuantity(0),
          currentBorrowing: null,
        },
        'Book retrieved successfully',
      );
    }

    const now = this.clock.now();
    const member = await this.members.findByCode(activeBorrowing.memberCode);

    return ok(
      {
        code: book.code,
        title: book.title,
        author: book.author,
        stock: book.stock,
        available: book.availableQuantity(1),
        currentBorrowing: {
          memberCode: activeBorrowing.memberCode,
          memberName: member?.name ?? '(unknown)',
          borrowedAt: activeBorrowing.borrowedAt.toISOString(),
          dueAt: activeBorrowing.dueAt.toISOString(),
          daysBorrowed: activeBorrowing.daysBorrowed(now),
          isOverdue: activeBorrowing.isOverdue(now),
        },
      },
      'Book retrieved successfully',
    );
  }
}
