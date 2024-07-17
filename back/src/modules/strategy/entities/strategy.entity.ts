import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
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
  @IsUUID()
  userId: string;

  @ApiProperty()
  @Column()
  @IsUUID()
  accountId: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: StrategyType })
  @IsEnum(StrategyType)
  type: StrategyType;

  @ApiProperty()
  @Column()
  @IsNotEmpty()
  @IsString()
  marketId: string;

  @ApiProperty()
  @Column('json')
  options: StrategyOptions;

  @ApiProperty()
  @Column('simple-array')
  @IsString({ each: true })
  orders: string[];

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  takeProfitOrderId?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  stopLossOrderId?: string;
}
