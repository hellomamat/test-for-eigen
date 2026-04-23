import { ApiProperty } from '@nestjs/swagger';

export class CurrentBorrowingDto {
  @ApiProperty({ example: 'M001' })
  memberCode!: string;

  @ApiProperty({ example: 'Angga' })
  memberName!: string;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  borrowedAt!: string;

  @ApiProperty({
    example: '2026-04-22T10:00:00.000Z',
    description: 'Due date = borrowedAt + 7 days. Returning after this incurs a penalty.',
  })
  dueAt!: string;

  @ApiProperty({ example: 5 })
  daysBorrowed!: number;

  @ApiProperty({ example: false })
  isOverdue!: boolean;
}

export class BookDetailDto {
  @ApiProperty({ example: 'JK-45' })
  code!: string;

  @ApiProperty({ example: 'Harry Potter' })
  title!: string;

  @ApiProperty({ example: 'J.K Rowling' })
  author!: string;

  @ApiProperty({ example: 1 })
  stock!: number;

  @ApiProperty({ example: 0, description: 'Stock minus active borrowings' })
  available!: number;

  @ApiProperty({
    type: () => CurrentBorrowingDto,
    nullable: true,
    description: 'Null when the book is available',
  })
  currentBorrowing!: CurrentBorrowingDto | null;
}
