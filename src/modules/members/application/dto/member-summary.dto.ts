import { ApiProperty } from '@nestjs/swagger';

export class MemberSummaryDto {
  @ApiProperty({ example: 'M001' })
  code!: string;

  @ApiProperty({ example: 'Angga' })
  name!: string;

  @ApiProperty({ example: 0, description: 'Active (not yet returned) borrowings' })
  borrowedCount!: number;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'ISO timestamp until which this member is penalized, or null if not',
  })
  penalizedUntil!: string | null;
}
