import { Injectable } from '@nestjs/common';
import { Book as BookRow, Prisma } from '@prisma/client';
import { Book } from '../domain/book.entity';
import { BookQueryOptions, BookRepository } from '../domain/book.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrismaBookRepository implements BookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: BookQueryOptions = {}): Promise<Book[]> {
    const rows = await this.prisma.book.findMany({
      where: this.buildWhere(options),
      orderBy: { code: 'asc' },
      skip: options.skip,
      take: options.take,
    });
    return rows.map(toDomain);
  }

  async count(options: Omit<BookQueryOptions, 'skip' | 'take'> = {}): Promise<number> {
    return this.prisma.book.count({ where: this.buildWhere(options) });
  }

  async findByCode(code: string): Promise<Book | null> {
    const row = await this.prisma.book.findUnique({ where: { code } });
    return row ? toDomain(row) : null;
  }

  async save(book: Book): Promise<Book> {
    const data = {
      code: book.code,
      title: book.title,
      author: book.author,
      stock: book.stock,
    };
    const row = await this.prisma.book.upsert({
      where: { code: book.code },
      create: data,
      update: data,
    });
    return toDomain(row);
  }

  async deleteByCode(code: string): Promise<void> {
    await this.prisma.book.delete({ where: { code } });
  }

  private buildWhere(
    options: Pick<BookQueryOptions, 'search' | 'available'>,
  ): Prisma.BookWhereInput | undefined {
    const conditions: Prisma.BookWhereInput[] = [];

    const search = options.search?.trim();
    if (search) {
      conditions.push({
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (options.available === true) {
      conditions.push({ borrowings: { none: { returnedAt: null } } });
    } else if (options.available === false) {
      conditions.push({ borrowings: { some: { returnedAt: null } } });
    }

    if (conditions.length === 0) return undefined;
    if (conditions.length === 1) return conditions[0];
    return { AND: conditions };
  }
}

function toDomain(row: BookRow): Book {
  return Book.create({
    code: row.code,
    title: row.title,
    author: row.author,
    stock: row.stock,
  });
}
