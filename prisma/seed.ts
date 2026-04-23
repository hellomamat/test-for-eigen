import { PrismaClient } from '@prisma/client';
import { MOCK_BOOKS, MOCK_MEMBERS } from '../src/database/seeds/mock-data';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const bookCount = await prisma.book.count();
  if (bookCount === 0) {
    await prisma.book.createMany({ data: MOCK_BOOKS, skipDuplicates: true });
    console.log(`Seeded ${MOCK_BOOKS.length} books`);
  } else {
    console.log(`Books already seeded (${bookCount} rows), skipping`);
  }

  const memberCount = await prisma.member.count();
  if (memberCount === 0) {
    await prisma.member.createMany({
      data: MOCK_MEMBERS.map((m) => ({ ...m, penalizedUntil: null })),
      skipDuplicates: true,
    });
    console.log(`Seeded ${MOCK_MEMBERS.length} members`);
  } else {
    console.log(`Members already seeded (${memberCount} rows), skipping`);
  }
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
