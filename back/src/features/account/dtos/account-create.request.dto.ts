import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { ExchangeType } from '../../exchange/exchange.types';

export class AccountCreateRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Name is required.' })
  @IsString({ message: 'Name must be a string.' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Key is required.' })
  @IsString({ message: 'Key must be a string.' })
  key: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Secret is required.' })
  @IsString({ message: 'Secret must be a string.' })
  secret: string;

  @ApiProperty({ enum: ExchangeType, example: ExchangeType.Bybit })
  @IsNotEmpty({ message: 'Exchange type is required.' })
  @IsEnum(ExchangeType, { message: 'Invalid exchange type.' })
  exchange: ExchangeType;
}
