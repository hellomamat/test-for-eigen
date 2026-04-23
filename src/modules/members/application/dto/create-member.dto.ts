import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateMemberDto {
  @ApiProperty({ example: 'M004', description: 'Unique member code' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'code must contain only letters, digits, and dashes',
  })
  code!: string;

  @ApiProperty({ example: 'Dedi', description: 'Member full name' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}
