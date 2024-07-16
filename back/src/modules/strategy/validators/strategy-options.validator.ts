import { Injectable, Logger } from '@nestjs/common';

import { CurrencyMode } from '../types/currency-mode.enum';
import { IBaseStrategyOptions } from '../types/options/base-strategy-options.interface';
import { IFibonacciMartingaleStrategyOptions } from '../types/options/fibonacci-martingale-strategy-options.interface';
import { StrategyType } from '../types/strategy-type.enum';

@Injectable()
export class StrategyOptionsValidator {
  private readonly logger = new Logger(StrategyOptionsValidator.name);

  validateOptions(type: StrategyType, options: any): boolean {
    switch (type) {
      case StrategyType.FIBONACCI_MARTINGALE:
        return this.validateFibonacciMartingaleOptions(options);
      default:
        this.logger.warn(`Unknown strategy type: ${type}`);
        return false;
    }
  }

  private validateBaseOptions(options: IBaseStrategyOptions): boolean {
    if (!Object.values(CurrencyMode).includes(options.currencyMode)) {
      this.logger.warn(`Invalid currency mode: ${options.currencyMode}`);
      return false;
    }
    return true;
  }

  private validateFibonacciMartingaleOptions(options: IFibonacciMartingaleStrategyOptions): boolean {
    if (!this.validateBaseOptions(options)) {
      return false;
    }

    const numericFields = [
      'baseOrderSize',
      'safetyOrderSize',
      'safetyOrderStepScale',
      'safetyOrderVolumeScale',
      'initialSafetyOrderDistancePct',
      'takeProfitPercentage',
      'maxSafetyOrdersCount'
    ];
    for (const field of numericFields) {
      if (typeof options[field] !== 'number' || options[field] <= 0) {
        this.logger.warn(`Invalid value for ${field}: must be a positive number`);
        return false;
      }
    }
    return true;
  }
}
