import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

const CODE_PATTERN = /^[A-Za-z0-9-]+$/;
const CODE_PATTERN_MESSAGE =
  '$property must contain only letters, digits, and dashes (no spaces or symbols)';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class BorrowBookDto {
  @ApiProperty({ example: 'M001', description: 'Member code' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(CODE_PATTERN, { message: CODE_PATTERN_MESSAGE })
  memberCode!: string;

  @ApiProperty({ example: 'JK-45', description: 'Book code' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(CODE_PATTERN, { message: CODE_PATTERN_MESSAGE })
  bookCode!: string;
}

export class ReturnBookDto {
  @ApiProperty({ example: 'M001', description: 'Member code' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(CODE_PATTERN, { message: CODE_PATTERN_MESSAGE })
  memberCode!: string;

  @ApiProperty({ example: 'JK-45', description: 'Book code' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(CODE_PATTERN, { message: CODE_PATTERN_MESSAGE })
  bookCode!: string;
}

export class BorrowingResponseDto {
  @ApiProperty({ example: 'b5a11f8c-2b2d-4f4d-8ef1-8f4d3d8d9e0a' })
  id!: string;

  @ApiProperty({ example: 'M001' })
  memberCode!: string;

  @ApiProperty({ example: 'JK-45' })
  bookCode!: string;

  @ApiProperty({ example: '2026-04-21T10:00:00.000Z' })
  borrowedAt!: string;

  @ApiProperty({ example: null, nullable: true })
  returnedAt!: string | null;
}

export class ReturnResponseDto extends BorrowingResponseDto {
  @ApiProperty({ example: 4, description: 'Days between borrow and return' })
  daysBorrowed!: number;

  @ApiProperty({ example: false })
  penaltyApplied!: boolean;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Penalty expiry ISO timestamp if penaltyApplied is true',
  })
  penalizedUntil!: string | null;
}
