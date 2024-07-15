import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { ExchangeType } from '@exchange/types/exchange-type.enum';

export class AccountUpdateRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Name must be a string if provided.' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters.' })
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Key must be a string if provided.' })
  @MaxLength(255, { message: 'Key must not exceed 255 characters.' })
  key?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Secret must be a string if provided.' })
  @MaxLength(255, { message: 'Secret must not exceed 255 characters.' })
  secret?: string;

  @ApiProperty({ enum: ExchangeType, example: ExchangeType.Bybit, required: false })
  @IsOptional()
  @IsEnum(ExchangeType, { message: 'Invalid exchange type if provided.' })
  exchange?: ExchangeType;
}
