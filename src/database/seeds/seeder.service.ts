import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MOCK_BOOKS, MOCK_MEMBERS } from './mock-data';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    const bookCount = await this.prisma.book.count();
    if (bookCount === 0) {
      await this.prisma.book.createMany({ data: MOCK_BOOKS, skipDuplicates: true });
      this.logger.log(`Seeded ${MOCK_BOOKS.length} books`);
    }

    const memberCount = await this.prisma.member.count();
    if (memberCount === 0) {
      await this.prisma.member.createMany({
        data: MOCK_MEMBERS.map((m) => ({ ...m, penalizedUntil: null })),
        skipDuplicates: true,
      });
      this.logger.log(`Seeded ${MOCK_MEMBERS.length} members`);
    }
  }
}
