import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetMembersUseCase } from '../application/use-cases/get-members.use-case';
import { GetMemberByCodeUseCase } from '../application/use-cases/get-member-by-code.use-case';
import { CreateMemberUseCase } from '../application/use-cases/create-member.use-case';
import { DeleteMemberUseCase } from '../application/use-cases/delete-member.use-case';
import { MemberSummaryDto } from '../application/dto/member-summary.dto';
import { MemberDetailDto } from '../application/dto/member-detail.dto';
import { GetMemberDto } from '../application/dto/member-repository.dto';
import { CreateMemberDto } from '../application/dto/create-member.dto';
import {
  ApiCreatedEnvelope,
  ApiErrorEnvelope,
  ApiOkEnvelope,
  ApiResponse,
} from '../../../shared/utils/api-response';

class DeleteResultDto {
  code!: string;
}

@ApiTags('members')
@Controller('members')
export class MemberController {
  constructor(
    private readonly getMembers: GetMembersUseCase,
    private readonly getMemberByCode: GetMemberByCodeUseCase,
    private readonly createMember: CreateMemberUseCase,
    private readonly deleteMember: DeleteMemberUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all members (optionally search by name/code)' })
  @ApiOkEnvelope(MemberSummaryDto, {
    array: true,
    message: ['Members retrieved successfully'],
  })
  @ApiErrorEnvelope(400, ['search must be a string'], 'Validation error')
  list(@Query() query: GetMemberDto): Promise<ApiResponse<MemberSummaryDto[]>> {
    return this.getMembers.execute(query);
  }

  @Get(':code')
  @ApiOperation({
    summary: 'Get a member by code with the books they are currently borrowing',
  })
  @ApiParam({ name: 'code', example: 'M001' })
  @ApiOkEnvelope(MemberDetailDto, { message: ['Member retrieved successfully'] })
  @ApiErrorEnvelope(404, ['Member M999 not found'], 'Member not found')
  getByCode(@Param('code') code: string): Promise<ApiResponse<MemberDetailDto>> {
    return this.getMemberByCode.execute(code);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new member' })
  @ApiCreatedEnvelope(MemberSummaryDto, { message: ['Member created successfully'] })
  @ApiErrorEnvelope(400, ['code should not be empty', 'name should not be empty'])
  @ApiErrorEnvelope(422, ['Member M001 already exists'], 'Code already taken')
  create(@Body() dto: CreateMemberDto): Promise<ApiResponse<MemberSummaryDto>> {
    return this.createMember.execute(dto);
  }

  @Delete(':code')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a member (only allowed when no active borrowings)' })
  @ApiParam({ name: 'code', example: 'M001' })
  @ApiOkEnvelope(DeleteResultDto, { message: ['Member M001 deleted successfully'] })
  @ApiErrorEnvelope(404, ['Member M999 not found'])
  @ApiErrorEnvelope(
    422,
    ['Member M001 still has 2 active borrowing(s) and cannot be deleted'],
    'Member is still borrowing',
  )
  delete(@Param('code') code: string): Promise<ApiResponse<{ code: string }>> {
    return this.deleteMember.execute(code);
  }
}
