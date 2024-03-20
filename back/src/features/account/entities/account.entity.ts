import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { ExchangeType } from '../../exchange/exchange.types';
import { AccountCreateRequestDto } from '../dto/account-create.request.dto';
import { AccountUpdateRequestDto } from '../dto/account-update.request.dto';

@Entity()
export class Account {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  key: string;

  @ApiProperty()
  @Column()
  secret: string;

  @ApiProperty({ enum: ExchangeType, example: ExchangeType.Bybit })
  @Column({ type: 'enum', enum: ExchangeType })
  exchange: ExchangeType;

  constructor(
    name: string,
    key: string,
    secret: string,
    exchange: ExchangeType,
  ) {
    this.name = name;
    this.key = key;
    this.secret = secret;
    this.exchange = exchange;
  }

  static fromDto(
    data: AccountCreateRequestDto | AccountUpdateRequestDto,
  ): Account {
    return new Account(data.name, data.key, data.secret, data.exchange);
  }
}
