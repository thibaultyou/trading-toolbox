import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsString, IsUUID } from 'class-validator';

import { ExchangeType } from '@exchange/types/exchange-type.enum';

@Exclude()
export class AccountDto {
  @Expose()
  @ApiProperty({
    description: 'The unique identifier of the account.',
    example: '1660782b-9765-4ede-9f0f-94d235bbc170'
  })
  @IsUUID()
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the account.',
    example: 'TEST'
  })
  @IsString()
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The API key associated with the account, partially masked for security.',
    example: '**************9diA'
  })
  @IsString()
  key: string;

  @Expose()
  @ApiProperty({
    description: 'The type of exchange the account is associated with.',
    enum: ExchangeType,
    example: ExchangeType.Bybit
  })
  @IsEnum(ExchangeType)
  exchange: ExchangeType;
}
