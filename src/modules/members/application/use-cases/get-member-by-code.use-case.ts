import { Inject, Injectable } from '@nestjs/common';
import { MEMBER_REPOSITORY, MemberRepository } from '../../domain/member.repository';
import { BOOK_REPOSITORY, BookRepository } from '../../../books/domain/book.repository';
import {
  BORROWING_REPOSITORY,
  BorrowingRepository,
} from '../../../borrowings/domain/borrowing.repository';
import { NotFoundDomainError } from '../../../../shared/exceptions/domain.exception';
import { CLOCK, Clock } from '../../../../shared/clock';
import { MemberDetailDto } from '../dto/member-detail.dto';
import { ApiResponse, ok } from '../../../../shared/utils/api-response';

@Injectable()
export class GetMemberByCodeUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY) private readonly members: MemberRepository,
    @Inject(BOOK_REPOSITORY) private readonly books: BookRepository,
    @Inject(BORROWING_REPOSITORY) private readonly borrowings: BorrowingRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(code: string): Promise<ApiResponse<MemberDetailDto>> {
    const member = await this.members.findByCode(code);
    if (!member) throw new NotFoundDomainError(`Member ${code} not found`);

    const now = this.clock.now();
    const activeBorrowings = await this.borrowings.findActiveByMember(code);

    const books = await Promise.all(
      activeBorrowings.map((b) => this.books.findByCode(b.bookCode)),
    );

    const borrowings = activeBorrowings.map((b, i) => {
      const book = books[i];
      return {
        code: b.bookCode,
        title: book?.title ?? '(unknown)',
        author: book?.author ?? '(unknown)',
        borrowedAt: b.borrowedAt.toISOString(),
        daysBorrowed: b.daysBorrowed(now),
        isOverdue: b.isOverdue(now),
      };
    });

    return ok(
      {
        code: member.code,
        name: member.name,
        penalizedUntil: member.penalizedUntil ? member.penalizedUntil.toISOString() : null,
        borrowings,
      },
      'Member retrieved successfully',
    );
  }
}
