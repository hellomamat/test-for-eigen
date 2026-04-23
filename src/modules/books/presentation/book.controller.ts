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
import { GetAvailableBooksUseCase } from '../application/use-cases/get-available-books.use-case';
import { GetBookByCodeUseCase } from '../application/use-cases/get-book-by-code.use-case';
import { CreateBookUseCase } from '../application/use-cases/create-book.use-case';
import { DeleteBookUseCase } from '../application/use-cases/delete-book.use-case';
import { BookAvailabilityDto } from '../application/dto/book-availability.dto';
import { BookDetailDto } from '../application/dto/book-detail.dto';
import { GetBookDto } from '../application/dto/book-repository.dto';
import { CreateBookDto } from '../application/dto/create-book.dto';
import {
  ApiCreatedEnvelope,
  ApiErrorEnvelope,
  ApiOkEnvelope,
  ApiResponse,
} from '../../../shared/utils/api-response';

class DeleteResultDto {
  code!: string;
}

@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(
    private readonly getAvailableBooks: GetAvailableBooksUseCase,
    private readonly getBookByCode: GetBookByCodeUseCase,
    private readonly createBook: CreateBookUseCase,
    private readonly deleteBook: DeleteBookUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all books (paginated) with available quantities' })
  @ApiOkEnvelope(BookAvailabilityDto, {
    array: true,
    paginated: true,
    message: ['Books retrieved successfully'],
  })
  @ApiErrorEnvelope(
    400,
    ['page must not be less than 1', 'available must be "true" or "false"'],
    'Validation error',
  )
  list(@Query() query: GetBookDto): Promise<ApiResponse<BookAvailabilityDto[]>> {
    return this.getAvailableBooks.execute(query);
  }

  @Get(':code')
  @ApiOperation({
    summary: 'Get a book by code, including current borrowing info if any',
  })
  @ApiParam({ name: 'code', example: 'JK-45' })
  @ApiOkEnvelope(BookDetailDto, { message: ['Book retrieved successfully'] })
  @ApiErrorEnvelope(404, ['Book JK-999 not found'], 'Book not found')
  getByCode(@Param('code') code: string): Promise<ApiResponse<BookDetailDto>> {
    return this.getBookByCode.execute(code);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new book' })
  @ApiCreatedEnvelope(BookAvailabilityDto, { message: ['Book created successfully'] })
  @ApiErrorEnvelope(
    400,
    ['code should not be empty', 'stock must not be less than 0'],
    'Validation error',
  )
  @ApiErrorEnvelope(422, ['Book JK-45 already exists'], 'Code already taken')
  create(@Body() dto: CreateBookDto): Promise<ApiResponse<BookAvailabilityDto>> {
    return this.createBook.execute(dto);
  }

  @Delete(':code')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a book (only allowed when it is not currently borrowed)' })
  @ApiParam({ name: 'code', example: 'JK-45' })
  @ApiOkEnvelope(DeleteResultDto, { message: ['Book JK-45 deleted successfully'] })
  @ApiErrorEnvelope(404, ['Book JK-999 not found'])
  @ApiErrorEnvelope(
    422,
    ['Book JK-45 is currently borrowed by member M001 and cannot be deleted'],
    'Book is currently borrowed',
  )
  delete(@Param('code') code: string): Promise<ApiResponse<{ code: string }>> {
    return this.deleteBook.execute(code);
  }
}
