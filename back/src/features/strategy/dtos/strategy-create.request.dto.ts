import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsObject, IsString, IsUUID, ValidateNested } from 'class-validator';

import { FibonacciMartingaleStrategyOptions } from './options/fibonacci-martingale-strategy-options.dto';
import { CurrencyMode } from '../types/currency-mode.enum';
import { StrategyType } from '../types/strategy-type.enum';

export class StrategyCreateRequestDto {
  @ApiProperty({
    description: 'The unique identifier of the account.',
    example: '1660782b-9765-4ede-9f0f-94d235bbc170'
  })
  @IsNotEmpty({ message: 'Account ID is required.' })
  @IsUUID('4', { message: 'Account ID must be a valid UUID.' })
  accountId: string;

  @ApiProperty({
    description: 'The type of strategy to be created.',
    enum: StrategyType,
    example: StrategyType.FIBONACCI_MARTINGALE
  })
  @IsNotEmpty({ message: 'Strategy type is required.' })
  @IsEnum(StrategyType, { message: 'Invalid strategy type.' })
  type: StrategyType;

  @ApiProperty({
    description: 'The market ID for the trading pair.',
    example: 'FTMUSDT'
  })
  @IsNotEmpty({ message: 'Market ID is required.' })
  @IsString({ message: 'Market ID must be a string.' })
  marketId: string;

  // TODO add conditional validation according to specified type
  @ApiProperty({
    description: 'The options for the strategy.',
    type: 'object',
    example: {
      currencyMode: CurrencyMode.QUOTE,
      baseOrderSize: 3,
      safetyOrderSize: 2,
      safetyOrderStepScale: 1.7,
      safetyOrderVolumeScale: 2.8,
      initialSafetyOrderDistancePct: 0.89,
      takeProfitPercentage: 1.49,
      maxSafetyOrdersCount: 4
    }
  })
  @IsNotEmpty({ message: 'Strategy options are required.' })
  @IsObject({ message: 'Strategy options must be an object.' })
  @ValidateNested()
  @Type(() => FibonacciMartingaleStrategyOptions)
  options: FibonacciMartingaleStrategyOptions;
}
