import { ApiProperty } from '@nestjs/swagger';

import { maskString } from '../../../common/utils/string.util';
import { ExchangeType } from '../../exchange/exchange.types';
import { Account } from '../entities/account.entity';

export class AccountReadResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the account.',
    example: '1660782b-9765-4ede-9f0f-94d235bbc170'
  })
  id: string;

  @ApiProperty({
    description: 'The name of the account.',
    example: 'TEST'
  })
  name: string;

  @ApiProperty({
    description: 'The API key associated with the account, partially masked for security.',
    example: '**************9diA'
  })
  key: string;

  @ApiProperty({
    description: 'The type of exchange the account is associated with.',
    enum: ExchangeType,
    example: ExchangeType.Bybit
  })
  exchange: ExchangeType;

  constructor(account: Account) {
    this.id = account.id;
    this.name = account.name;
    this.key = maskString(account.key);
    this.exchange = account.exchange;
  }
}
