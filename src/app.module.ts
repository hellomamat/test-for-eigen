import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BooksModule } from './modules/books/books.module';
import { MembersModule } from './modules/members/members.module';
import { BorrowingsModule } from './modules/borrowings/borrowings.module';
import { SeederModule } from './database/seeds/seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BooksModule,
    MembersModule,
    BorrowingsModule,
    SeederModule,
  ],
})
export class AppModule {}
