import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { CurrencyMode } from '../../types/currency-mode.enum';
import { IBaseStrategyOptions } from '../../types/options/base-strategy-options.interface';

export class BaseStrategyOptions implements IBaseStrategyOptions {
  @ApiProperty({ enum: CurrencyMode, example: CurrencyMode.QUOTE })
  @IsEnum(CurrencyMode)
  currencyMode: CurrencyMode;
}
