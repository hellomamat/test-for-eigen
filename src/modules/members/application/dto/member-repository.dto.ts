import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GetMemberDto {
  @ApiPropertyOptional({
    example: 'Angga',
    description: 'Case-insensitive search across name and code',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(128)
  search?: string;
}
