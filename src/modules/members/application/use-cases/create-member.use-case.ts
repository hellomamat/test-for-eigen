import { Inject, Injectable } from '@nestjs/common';
import { MEMBER_REPOSITORY, MemberRepository } from '../../domain/member.repository';
import { Member } from '../../domain/member.entity';
import { BusinessRuleViolation } from '../../../../shared/exceptions/domain.exception';
import { CreateMemberDto } from '../dto/create-member.dto';
import { MemberSummaryDto } from '../dto/member-summary.dto';
import { ApiResponse, ok } from '../../../../shared/utils/api-response';

@Injectable()
export class CreateMemberUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY) private readonly members: MemberRepository,
  ) {}

  async execute(dto: CreateMemberDto): Promise<ApiResponse<MemberSummaryDto>> {
    const existing = await this.members.findByCode(dto.code);
    if (existing) {
      throw new BusinessRuleViolation(`Member ${dto.code} already exists`);
    }

    const member = Member.create({ code: dto.code, name: dto.name });
    const saved = await this.members.save(member);

    return ok(
      {
        code: saved.code,
        name: saved.name,
        borrowedCount: 0,
        penalizedUntil: null,
      },
      'Member created successfully',
    );
  }
}
