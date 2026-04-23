import { Inject, Injectable } from '@nestjs/common';
import { MEMBER_REPOSITORY, MemberRepository } from '../../domain/member.repository';
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
export class DeleteMemberUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY) private readonly members: MemberRepository,
    @Inject(BORROWING_REPOSITORY) private readonly borrowings: BorrowingRepository,
  ) {}

  async execute(code: string): Promise<ApiResponse<{ code: string }>> {
    const member = await this.members.findByCode(code);
    if (!member) {
      throw new NotFoundDomainError(`Member ${code} not found`);
    }

    const activeCount = await this.borrowings.countActiveByMemberCode(code);
    if (activeCount > 0) {
      throw new BusinessRuleViolation(
        `Member ${code} still has ${activeCount} active borrowing(s) and cannot be deleted`,
      );
    }

    await this.members.deleteByCode(code);
    return ok({ code }, `Member ${code} deleted successfully`);
  }
}
