import { ApiProperty } from '@nestjs/swagger';

import { Strategy } from '../entities/strategy.entity';
import { StrategyOptions } from '../types/strategy-options.type';
import { StrategyType } from '../types/strategy-type.enum';

export class StrategyReadResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: StrategyType })
  type: StrategyType;

  @ApiProperty()
  marketId: string;

  @ApiProperty()
  accountId: string;

  @ApiProperty()
  options: StrategyOptions;

  @ApiProperty()
  orders: string[];

  @ApiProperty({ required: false })
  takeProfitOrderId?: string;

  @ApiProperty({ required: false })
  stopLossOrderId?: string;

  constructor(strategy: Strategy) {
    Object.assign(this, strategy);
  }
}
