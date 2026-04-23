import { Module, forwardRef } from '@nestjs/common';
import { PrismaBorrowingRepository } from './infrastructure/borrowing.repository.impl';
import { BORROWING_REPOSITORY } from './domain/borrowing.repository';
import { BorrowingController } from './presentation/borrowing.controller';
import { BorrowBookUseCase } from './application/use-cases/borrow-book.use-case';
import { ReturnBookUseCase } from './application/use-cases/return-book.use-case';
import { CLOCK, SystemClock } from '../../shared/clock';
import { BooksModule } from '../books/books.module';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [forwardRef(() => BooksModule), forwardRef(() => MembersModule)],
  controllers: [BorrowingController],
  providers: [
    BorrowBookUseCase,
    ReturnBookUseCase,
    { provide: BORROWING_REPOSITORY, useClass: PrismaBorrowingRepository },
    { provide: CLOCK, useClass: SystemClock },
  ],
  exports: [BORROWING_REPOSITORY],
})
export class BorrowingsModule {}
