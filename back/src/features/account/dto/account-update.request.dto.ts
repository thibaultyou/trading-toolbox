import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ExchangeType } from '../../exchange/exchange.types';

export class AccountUpdateRequestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  secret?: string;

  @ApiProperty({
    enum: ExchangeType,
    example: ExchangeType.Bybit,
    required: false
  })
  @IsEnum(ExchangeType)
  @IsOptional()
  exchange?: ExchangeType;
}
