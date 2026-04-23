import { Module, forwardRef } from '@nestjs/common';
import { PrismaMemberRepository } from './infrastructure/member.repository.impl';
import { MEMBER_REPOSITORY } from './domain/member.repository';
import { MemberController } from './presentation/member.controller';
import { GetMembersUseCase } from './application/use-cases/get-members.use-case';
import { GetMemberByCodeUseCase } from './application/use-cases/get-member-by-code.use-case';
import { CreateMemberUseCase } from './application/use-cases/create-member.use-case';
import { DeleteMemberUseCase } from './application/use-cases/delete-member.use-case';
import { BorrowingsModule } from '../borrowings/borrowings.module';
import { BooksModule } from '../books/books.module';
import { CLOCK, SystemClock } from '../../shared/clock';

@Module({
  imports: [forwardRef(() => BorrowingsModule), forwardRef(() => BooksModule)],
  controllers: [MemberController],
  providers: [
    GetMembersUseCase,
    GetMemberByCodeUseCase,
    CreateMemberUseCase,
    DeleteMemberUseCase,
    { provide: MEMBER_REPOSITORY, useClass: PrismaMemberRepository },
    { provide: CLOCK, useClass: SystemClock },
  ],
  exports: [MEMBER_REPOSITORY],
})
export class MembersModule {}
