import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BorrowBookUseCase } from '../application/use-cases/borrow-book.use-case';
import { ReturnBookUseCase } from '../application/use-cases/return-book.use-case';
import {
  BorrowBookDto,
  BorrowingResponseDto,
  ReturnBookDto,
  ReturnResponseDto,
} from '../application/dto/borrow-book.dto';
import {
  ApiCreatedEnvelope,
  ApiErrorEnvelope,
  ApiOkEnvelope,
  ApiResponse,
} from '../../../shared/utils/api-response';

@ApiTags('borrowings')
@Controller('borrowings')
export class BorrowingController {
  constructor(
    private readonly borrowBook: BorrowBookUseCase,
    private readonly returnBook: ReturnBookUseCase,
  ) {}

  @Post('borrow')
  @HttpCode(201)
  @ApiOperation({ summary: 'Borrow a book for a member' })
  @ApiCreatedEnvelope(BorrowingResponseDto, {
    message: ['Book borrowed successfully'],
  })
  @ApiErrorEnvelope(400, ['memberCode should not be empty'], 'Validation error')
  @ApiErrorEnvelope(404, ['Member M001 not found'], 'Member or book not found')
  @ApiErrorEnvelope(
    422,
    ['Member M001 already has 2 active borrowings (max 2)'],
    'Business rule violated',
  )
  borrow(@Body() dto: BorrowBookDto): Promise<ApiResponse<BorrowingResponseDto>> {
    return this.borrowBook.execute(dto.memberCode, dto.bookCode);
  }

  @Post('return')
  @HttpCode(200)
  @ApiOperation({ summary: 'Return a borrowed book' })
  @ApiOkEnvelope(ReturnResponseDto, {
    message: ['Book returned successfully'],
  })
  @ApiErrorEnvelope(
    404,
    ['No active borrowing found for member M001 and book JK-45'],
    'Borrowing not found',
  )
  return(@Body() dto: ReturnBookDto): Promise<ApiResponse<ReturnResponseDto>> {
    return this.returnBook.execute(dto.memberCode, dto.bookCode);
  }
}
