import { Inject, Injectable } from '@nestjs/common';
import { MEMBER_REPOSITORY, MemberRepository } from '../../domain/member.repository';
import {
  BORROWING_REPOSITORY,
  BorrowingRepository,
} from '../../../borrowings/domain/borrowing.repository';
import { MemberSummaryDto } from '../dto/member-summary.dto';
import { GetMemberDto } from '../dto/member-repository.dto';
import { ApiResponse, ok } from '../../../../shared/utils/api-response';

@Injectable()
export class GetMembersUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY) private readonly members: MemberRepository,
    @Inject(BORROWING_REPOSITORY) private readonly borrowings: BorrowingRepository,
  ) {}

  async execute(params: GetMemberDto = {}): Promise<ApiResponse<MemberSummaryDto[]>> {
    const [members, countsByMember] = await Promise.all([
      this.members.findAll({ search: params.search }),
      this.borrowings.countActiveByMember(),
    ]);

    const data: MemberSummaryDto[] = members.map((m) => ({
      code: m.code,
      name: m.name,
      borrowedCount: countsByMember.get(m.code) ?? 0,
      penalizedUntil: m.penalizedUntil ? m.penalizedUntil.toISOString() : null,
    }));

    return ok(data, 'Members retrieved successfully');
  }
}
