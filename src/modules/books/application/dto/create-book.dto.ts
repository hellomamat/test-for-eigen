import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Matches, MaxLength, Min } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateBookDto {
  @ApiProperty({ example: 'JK-46', description: 'Unique book code' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'code must contain only letters, digits, and dashes',
  })
  code!: string;

  @ApiProperty({ example: 'Harry Potter and the Chamber of Secrets' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'J.K Rowling' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author!: string;

  @ApiProperty({ example: 1, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;
}
