import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

import { IFibonacciMartingaleStrategyOptions } from '../../types/options/fibonacci-martingale-strategy-options.interface';
import { BaseStrategyOptions } from './base-strategy-options.dto';

export class FibonacciMartingaleStrategyOptions
  extends BaseStrategyOptions
  implements IFibonacciMartingaleStrategyOptions
{
  @ApiProperty({ example: 3 })
  @IsNumber()
  @IsPositive()
  baseOrderSize: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsPositive()
  safetyOrderSize: number;

  @ApiProperty({ example: 1.7 })
  @IsNumber()
  @IsPositive()
  safetyOrderStepScale: number;

  @ApiProperty({ example: 2.8 })
  @IsNumber()
  @IsPositive()
  safetyOrderVolumeScale: number;

  @ApiProperty({ example: 0.89 })
  @IsNumber()
  @IsPositive()
  initialSafetyOrderDistancePct: number;

  @ApiProperty({ example: 1.49 })
  @IsNumber()
  @IsPositive()
  takeProfitPercentage: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @IsPositive()
  maxSafetyOrdersCount: number;
}
