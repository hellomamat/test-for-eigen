import { Module, forwardRef } from '@nestjs/common';
import { PrismaBookRepository } from './infrastructure/book.repository.impl';
import { BOOK_REPOSITORY } from './domain/book.repository';
import { BookController } from './presentation/book.controller';
import { GetAvailableBooksUseCase } from './application/use-cases/get-available-books.use-case';
import { GetBookByCodeUseCase } from './application/use-cases/get-book-by-code.use-case';
import { CreateBookUseCase } from './application/use-cases/create-book.use-case';
import { DeleteBookUseCase } from './application/use-cases/delete-book.use-case';
import { BorrowingsModule } from '../borrowings/borrowings.module';
import { MembersModule } from '../members/members.module';
import { CLOCK, SystemClock } from '../../shared/clock';

@Module({
  imports: [forwardRef(() => BorrowingsModule), forwardRef(() => MembersModule)],
  controllers: [BookController],
  providers: [
    GetAvailableBooksUseCase,
    GetBookByCodeUseCase,
    CreateBookUseCase,
    DeleteBookUseCase,
    { provide: BOOK_REPOSITORY, useClass: PrismaBookRepository },
    { provide: CLOCK, useClass: SystemClock },
  ],
  exports: [BOOK_REPOSITORY],
})
export class BooksModule {}
