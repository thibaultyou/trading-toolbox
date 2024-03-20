import { ApiProperty } from '@nestjs/swagger';

import { maskString } from '../../../utils/string.util';
import { ExchangeType } from '../../exchange/exchange.types';
import { Account } from '../entities/account.entity';

export class AccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  secret: string;

  @ApiProperty({ enum: ExchangeType, example: ExchangeType.Bybit })
  exchange: ExchangeType;

  constructor(account: Account) {
    this.id = account.id;
    this.name = account.name;
    this.key = maskString(account.key);
    this.secret = '********';
    this.exchange = account.exchange;
  }
}
