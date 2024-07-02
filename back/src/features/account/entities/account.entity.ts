import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { ExchangeType } from '../../exchange/exchange.types';
import { AccountCreateRequestDto } from '../dtos/account-create.request.dto';
import { AccountUpdateRequestDto } from '../dtos/account-update.request.dto';

@Entity()
@Unique(['name', 'user']) // Ensure account names are unique per user
@Unique(['key', 'user']) // Ensure API keys are unique per user
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

  @ManyToOne(() => User, (user) => user.accounts, { nullable: false })
  user: User;

  constructor(name: string, key: string, secret: string, exchange: ExchangeType, user: User) {
    this.name = name;
    this.key = key;
    this.secret = secret;
    this.exchange = exchange;
    this.user = user;
  }

  static fromDto(data: AccountCreateRequestDto, user: User): Account {
    return new Account(data.name, data.key, data.secret, data.exchange, user);
  }

  updateFromDto(data: Partial<AccountUpdateRequestDto>): void {
    if (data.name) this.name = data.name;

    if (data.key) this.key = data.key;

    if (data.secret) this.secret = data.secret;

    if (data.exchange) this.exchange = data.exchange;
  }
}
