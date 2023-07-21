import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { ExchangeType } from '../../exchange/exchange.types';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';

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

  static fromDto(data: CreateAccountDto | UpdateAccountDto): Account {
    return new Account(data.name, data.key, data.secret, data.exchange);
  }
}
