import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { Strategy } from '../entities/strategy.entity';
import { StrategyOptions } from '../types/strategy-options.type';
import { StrategyType } from '../types/strategy-type.enum';

@Exclude()
export class StrategyDto {
  @Expose()
  @ApiProperty()
  @IsUUID()
  id: string;

  @Expose()
  @ApiProperty({ enum: StrategyType })
  @IsEnum(StrategyType)
  type: StrategyType;

  @Expose()
  @ApiProperty()
  @IsString()
  marketId: string;

  @Expose()
  @ApiProperty()
  @IsUUID()
  accountId: string;

  @Expose()
  @ApiProperty()
  options: StrategyOptions;

  @Expose()
  @ApiProperty()
  @IsString({ each: true })
  orders: string[];

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  takeProfitOrderId?: string;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stopLossOrderId?: string;

  static fromEntity(strategy: Strategy): StrategyDto {
    return plainToClass(StrategyDto, strategy, { excludeExtraneousValues: true });
  }
}
