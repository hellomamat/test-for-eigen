import { Inject, Injectable } from '@nestjs/common';
import {
  MEMBER_REPOSITORY,
  MemberRepository,
} from '../../../members/domain/member.repository';
import {
  BORROWING_REPOSITORY,
  BorrowingRepository,
} from '../../domain/borrowing.repository';
import { NotFoundDomainError } from '../../../../shared/exceptions/domain.exception';
import { CLOCK, Clock } from '../../../../shared/clock';
import { ReturnResponseDto } from '../dto/borrow-book.dto';
import { ApiResponse, ok } from '../../../../shared/utils/api-response';

export const PENALTY_DAYS = 3;

@Injectable()
export class ReturnBookUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY) private readonly members: MemberRepository,
    @Inject(BORROWING_REPOSITORY) private readonly borrowings: BorrowingRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(memberCode: string, bookCode: string): Promise<ApiResponse<ReturnResponseDto>> {
    const now = this.clock.now();

    const member = await this.members.findByCode(memberCode);
    if (!member) throw new NotFoundDomainError(`Member ${memberCode} not found`);

    const borrowing = await this.borrowings.findActiveByMemberAndBook(memberCode, bookCode);
    if (!borrowing) {
      throw new NotFoundDomainError(
        `No active borrowing found for member ${memberCode} and book ${bookCode}`,
      );
    }

    const overdue = borrowing.isOverdue(now);
    const days = borrowing.daysBorrowed(now);

    borrowing.markReturned(now);
    const saved = await this.borrowings.save(borrowing);

    let penaltyApplied = false;
    if (overdue) {
      member.penalize(PENALTY_DAYS, now);
      await this.members.save(member);
      penaltyApplied = true;
    }

    return ok(
      {
        id: saved.id!,
        memberCode: saved.memberCode,
        bookCode: saved.bookCode,
        borrowedAt: saved.borrowedAt.toISOString(),
        returnedAt: saved.returnedAt!.toISOString(),
        daysBorrowed: days,
        penaltyApplied,
        penalizedUntil: penaltyApplied ? member.penalizedUntil!.toISOString() : null,
      },
      penaltyApplied ? 'Book returned with penalty' : 'Book returned successfully',
    );
  }
}
