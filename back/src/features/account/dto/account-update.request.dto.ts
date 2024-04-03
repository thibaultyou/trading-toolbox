import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ExchangeType } from '../../exchange/exchange.types';

export class AccountUpdateRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Name must be a string if provided.' })
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Key must be a string if provided.' })
  key?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Secret must be a string if provided.' })
  secret?: string;

  @ApiProperty({ enum: ExchangeType, example: ExchangeType.Bybit, required: false })
  @IsOptional()
  @IsEnum(ExchangeType, { message: 'Invalid exchange type if provided.' })
  exchange?: ExchangeType;
}
