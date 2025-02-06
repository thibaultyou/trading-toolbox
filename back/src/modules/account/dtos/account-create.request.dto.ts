import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { ExchangeType } from '@exchange/types/exchange-type.enum';

export class AccountCreateRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Name is required.' })
  @IsString({ message: 'Name must be a string.' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters.' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Key is required.' })
  @IsString({ message: 'Key must be a string.' })
  @MaxLength(255, { message: 'Key must not exceed 255 characters.' })
  key: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Secret is required.' })
  @IsString({ message: 'Secret must be a string.' })
  @MaxLength(255, { message: 'Secret must not exceed 255 characters.' })
  secret: string;

  @ApiProperty({
    required: false,
    description: 'Optional passphrase for some exchanges (e.g. Bitget).'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  passphrase?: string;

  @ApiProperty({ enum: ExchangeType, example: ExchangeType.Bybit })
  @IsNotEmpty({ message: 'Exchange type is required.' })
  @IsEnum(ExchangeType, { message: 'Invalid exchange type.' })
  exchange: ExchangeType;
}
