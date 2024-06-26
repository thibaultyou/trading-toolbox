import { Logger } from '@nestjs/common';

import { BalanceService } from '../../balance/balance.service';
import { IExecutionData } from '../../core/types/execution-data.interface';
import { OrderService } from '../../order/order.service';
import { TickerService } from '../../ticker/ticker.service';
import { CurrencyMode } from '../types/currency-mode.enum';
import { IStrategy } from '../types/strategy.interface';

export abstract class BaseStrategy {
  protected readonly logger = new Logger(BaseStrategy.name);

  constructor(
    protected orderService: OrderService,
    protected tickerService: TickerService,
    protected balanceService: BalanceService
  ) {}

  abstract process(accountId: string, strategy: IStrategy): Promise<void>;
  abstract handleOrderExecution(accountId: string, strategy: IStrategy, executionData: IExecutionData): Promise<void>;

  logOrder = (
    currencyMode: CurrencyMode,
    marketId: string,
    orderType: string,
    price: number,
    size: number,
    deviation: number | null = null
  ) => {
    let logMessage = `Calculated ${orderType} - Price: ${price.toFixed(5)}, Size: ${size.toFixed(8)} ${marketId}`;

    if (currencyMode === CurrencyMode.QUOTE) {
      const sizeInQuote = size * price;
      logMessage += ` ($${sizeInQuote.toFixed(2)})`;
    }

    if (deviation !== null) {
      logMessage += `, Deviation: ${deviation.toFixed(2)}%`;
    }

    this.logger.log(logMessage);
  };
}
