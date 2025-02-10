import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { ExchangeType } from '@exchange/types/exchange-type.enum';
import { User } from '@user/entities/user.entity';

@Entity()
@Unique(['name', 'user'])
@Unique(['key', 'user'])
export class Account {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @Column()
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty()
  @Column()
  @IsNotEmpty()
  @IsString()
  secret: string;

  @ApiProperty({ required: false, description: 'Optional passphrase, e.g. for Bitget' })
  @Column({ nullable: true })
  @IsString()
  passphrase?: string;

  @ApiProperty({ enum: ExchangeType, example: ExchangeType.Bybit })
  @Column({ type: 'enum', enum: ExchangeType })
  @IsEnum(ExchangeType)
  exchange: ExchangeType;

  @ManyToOne(() => User, (user) => user.accounts, { nullable: false })
  user: User;
}
