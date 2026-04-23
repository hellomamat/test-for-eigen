import { Inject, Injectable } from '@nestjs/common';
import { BOOK_REPOSITORY, BookRepository } from '../../../books/domain/book.repository';
import {
  MEMBER_REPOSITORY,
  MemberRepository,
} from '../../../members/domain/member.repository';
import {
  BORROWING_REPOSITORY,
  BorrowingRepository,
} from '../../domain/borrowing.repository';
import { Borrowing } from '../../domain/borrowing.entity';
import {
  BusinessRuleViolation,
  NotFoundDomainError,
} from '../../../../shared/exceptions/domain.exception';
import { CLOCK, Clock } from '../../../../shared/clock';
import { BorrowingResponseDto } from '../dto/borrow-book.dto';
import { ApiResponse, ok } from '../../../../shared/utils/api-response';

export const MAX_ACTIVE_BORROWINGS = 2;

@Injectable()
export class BorrowBookUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY) private readonly members: MemberRepository,
    @Inject(BOOK_REPOSITORY) private readonly books: BookRepository,
    @Inject(BORROWING_REPOSITORY) private readonly borrowings: BorrowingRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(memberCode: string, bookCode: string): Promise<ApiResponse<BorrowingResponseDto>> {
    const now = this.clock.now();

    const member = await this.members.findByCode(memberCode);
    if (!member) throw new NotFoundDomainError(`Member ${memberCode} not found`);

    const book = await this.books.findByCode(bookCode);
    if (!book) throw new NotFoundDomainError(`Book ${bookCode} not found`);

    if (member.isPenalized(now)) {
      throw new BusinessRuleViolation(
        `Member ${memberCode} is currently penalized until ${member.penalizedUntil!.toISOString()}`,
      );
    }

    const activeCount = await this.borrowings.countActiveByMemberCode(memberCode);
    if (activeCount >= MAX_ACTIVE_BORROWINGS) {
      throw new BusinessRuleViolation(
        `Member ${memberCode} already has ${activeCount} active borrowings (max ${MAX_ACTIVE_BORROWINGS})`,
      );
    }

    const alreadyBorrowed = await this.borrowings.findActiveByBook(bookCode);
    if (alreadyBorrowed) {
      throw new BusinessRuleViolation(
        `Book ${bookCode} is currently borrowed by another member`,
      );
    }

    const borrowing = Borrowing.create({
      memberCode,
      bookCode,
      borrowedAt: now,
      returnedAt: null,
    });

    const saved = await this.borrowings.save(borrowing);
    return ok(
      {
        id: saved.id!,
        memberCode: saved.memberCode,
        bookCode: saved.bookCode,
        borrowedAt: saved.borrowedAt.toISOString(),
        returnedAt: null,
      },
      'Book borrowed successfully',
    );
  }
}
