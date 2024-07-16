import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { StrategyOptions } from '../types/strategy-options.type';
import { StrategyType } from '../types/strategy-type.enum';

@Entity()
export class Strategy {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column()
  accountId: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: StrategyType })
  type: StrategyType;

  @ApiProperty()
  @Column()
  marketId: string;

  @ApiProperty()
  @Column('json')
  options: StrategyOptions;

  @ApiProperty()
  @Column('simple-array')
  orders: string[];

  constructor(data: Partial<Strategy>) {
    Object.assign(this, data);
  }
}
