import { ApiProperty } from '@nestjs/swagger';

export class BorrowedBookDto {
  @ApiProperty({ example: 'JK-45' })
  code!: string;

  @ApiProperty({ example: 'Harry Potter' })
  title!: string;

  @ApiProperty({ example: 'J.K Rowling' })
  author!: string;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  borrowedAt!: string;

  @ApiProperty({ example: 6, description: 'Days since the book was borrowed' })
  daysBorrowed!: number;

  @ApiProperty({ example: false, description: 'True if > 7 days since borrow' })
  isOverdue!: boolean;
}

export class MemberDetailDto {
  @ApiProperty({ example: 'M001' })
  code!: string;

  @ApiProperty({ example: 'Angga' })
  name!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Penalty expiry ISO timestamp, null if not penalized',
  })
  penalizedUntil!: string | null;

  @ApiProperty({ type: [BorrowedBookDto], description: 'Currently active borrowings' })
  borrowings!: BorrowedBookDto[];
}
