import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

import { ExchangeType } from '../../exchange/exchange.types';

export class AccountCreateRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  secret: string;

  @ApiProperty({ enum: ExchangeType, example: ExchangeType.Bybit })
  @IsEnum(ExchangeType)
  exchange: ExchangeType;
}
