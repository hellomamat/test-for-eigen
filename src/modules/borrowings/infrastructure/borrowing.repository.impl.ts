import { Injectable } from '@nestjs/common';
import { Borrowing as BorrowingRow } from '@prisma/client';
import { Borrowing } from '../domain/borrowing.entity';
import { BorrowingRepository } from '../domain/borrowing.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrismaBorrowingRepository implements BorrowingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(borrowing: Borrowing): Promise<Borrowing> {
    if (borrowing.id) {
      const row = await this.prisma.borrowing.update({
        where: { id: borrowing.id },
        data: {
          memberCode: borrowing.memberCode,
          bookCode: borrowing.bookCode,
          borrowedAt: borrowing.borrowedAt,
          returnedAt: borrowing.returnedAt,
        },
      });
      return toDomain(row);
    }

    const row = await this.prisma.borrowing.create({
      data: {
        memberCode: borrowing.memberCode,
        bookCode: borrowing.bookCode,
        borrowedAt: borrowing.borrowedAt,
        returnedAt: borrowing.returnedAt,
      },
    });
    return toDomain(row);
  }

  async findActiveByBook(bookCode: string): Promise<Borrowing | null> {
    const row = await this.prisma.borrowing.findFirst({
      where: { bookCode, returnedAt: null },
    });
    return row ? toDomain(row) : null;
  }

  async findActiveByMemberAndBook(
    memberCode: string,
    bookCode: string,
  ): Promise<Borrowing | null> {
    const row = await this.prisma.borrowing.findFirst({
      where: { memberCode, bookCode, returnedAt: null },
    });
    return row ? toDomain(row) : null;
  }

  async findActiveByMember(memberCode: string): Promise<Borrowing[]> {
    const rows = await this.prisma.borrowing.findMany({
      where: { memberCode, returnedAt: null },
      orderBy: { borrowedAt: 'asc' },
    });
    return rows.map(toDomain);
  }

  async countActiveByMemberCode(memberCode: string): Promise<number> {
    return this.prisma.borrowing.count({
      where: { memberCode, returnedAt: null },
    });
  }

  async countActiveByBook(): Promise<Map<string, number>> {
    const rows = await this.prisma.borrowing.groupBy({
      by: ['bookCode'],
      where: { returnedAt: null },
      _count: { _all: true },
    });
    return new Map(rows.map((r) => [r.bookCode, r._count._all]));
  }

  async countActiveByMember(): Promise<Map<string, number>> {
    const rows = await this.prisma.borrowing.groupBy({
      by: ['memberCode'],
      where: { returnedAt: null },
      _count: { _all: true },
    });
    return new Map(rows.map((r) => [r.memberCode, r._count._all]));
  }
}

function toDomain(row: BorrowingRow): Borrowing {
  return Borrowing.create({
    id: row.id,
    memberCode: row.memberCode,
    bookCode: row.bookCode,
    borrowedAt: row.borrowedAt,
    returnedAt: row.returnedAt,
  });
}
