import { Inject, Injectable } from '@nestjs/common';
import { BOOK_REPOSITORY, BookRepository } from '../../domain/book.repository';
import { Book } from '../../domain/book.entity';
import { BusinessRuleViolation } from '../../../../shared/exceptions/domain.exception';
import { CreateBookDto } from '../dto/create-book.dto';
import { BookAvailabilityDto } from '../dto/book-availability.dto';
import { ApiResponse, ok } from '../../../../shared/utils/api-response';

@Injectable()
export class CreateBookUseCase {
  constructor(@Inject(BOOK_REPOSITORY) private readonly books: BookRepository) {}

  async execute(dto: CreateBookDto): Promise<ApiResponse<BookAvailabilityDto>> {
    const existing = await this.books.findByCode(dto.code);
    if (existing) {
      throw new BusinessRuleViolation(`Book ${dto.code} already exists`);
    }

    const book = Book.create({
      code: dto.code,
      title: dto.title,
      author: dto.author,
      stock: dto.stock,
    });
    const saved = await this.books.save(book);

    return ok(
      {
        code: saved.code,
        title: saved.title,
        author: saved.author,
        stock: saved.stock,
        available: saved.availableQuantity(0),
      },
      'Book created successfully',
    );
  }
}
