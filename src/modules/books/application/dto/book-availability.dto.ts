import { ApiProperty } from '@nestjs/swagger';

export class BookAvailabilityDto {
  @ApiProperty({ example: 'JK-45' })
  code!: string;

  @ApiProperty({ example: 'Harry Potter' })
  title!: string;

  @ApiProperty({ example: 'J.K Rowling' })
  author!: string;

  @ApiProperty({ example: 1, description: 'Total stock of this title' })
  stock!: number;

  @ApiProperty({ example: 1, description: 'Stock minus active borrowings' })
  available!: number;
}
