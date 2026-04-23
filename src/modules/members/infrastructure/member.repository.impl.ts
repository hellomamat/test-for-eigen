import { Injectable } from '@nestjs/common';
import { Member as MemberRow } from '@prisma/client';
import { Member } from '../domain/member.entity';
import { MemberQueryOptions, MemberRepository } from '../domain/member.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrismaMemberRepository implements MemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: MemberQueryOptions = {}): Promise<Member[]> {
    const search = options.search?.trim();
    const where = search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;
    const rows = await this.prisma.member.findMany({ where, orderBy: { code: 'asc' } });
    return rows.map(toDomain);
  }

  async findByCode(code: string): Promise<Member | null> {
    const row = await this.prisma.member.findUnique({ where: { code } });
    return row ? toDomain(row) : null;
  }

  async save(member: Member): Promise<Member> {
    const data = {
      code: member.code,
      name: member.name,
      penalizedUntil: member.penalizedUntil,
    };
    const row = await this.prisma.member.upsert({
      where: { code: member.code },
      create: data,
      update: data,
    });
    return toDomain(row);
  }

  async deleteByCode(code: string): Promise<void> {
    await this.prisma.member.delete({ where: { code } });
  }
}

function toDomain(row: MemberRow): Member {
  return Member.create({
    code: row.code,
    name: row.name,
    penalizedUntil: row.penalizedUntil,
  });
}
