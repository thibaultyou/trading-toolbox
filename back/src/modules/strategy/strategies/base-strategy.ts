import { Logger } from '@nestjs/common';

import { IExecutionData } from '@exchange/types/execution-data.interface';
import { OrderService } from '@order/order.service';
import { TickerService } from '@ticker/ticker.service';
import { WalletService } from '@wallet/wallet.service';

import { CurrencyMode } from '../types/currency-mode.enum';
import { StrategyType } from '../types/strategy-type.enum';
import { IStrategy } from '../types/strategy.interface';
import { StrategyOptionsValidator } from '../validators/strategy-options.validator';

export abstract class BaseStrategy {
  protected readonly logger = new Logger(BaseStrategy.name);

  constructor(
    protected orderService: OrderService,
    protected tickerService: TickerService,
    protected walletService: WalletService,
    protected optionsValidator: StrategyOptionsValidator
  ) {}

  abstract process(accountId: string, strategy: IStrategy, executionData?: IExecutionData): Promise<void>;

  protected validateStrategyOptions(type: StrategyType, options: any): boolean {
    return this.optionsValidator.validateOptions(type, options);
  }

  async handleOrderExecution(accountId: string, strategy: IStrategy, executionData: IExecutionData) {
    this.logger.debug(
      `Handling order execution - AccountID: ${accountId} - StrategyID: ${strategy.id} - OrderID: ${executionData.orderId}`
    );

    const executedOrderIndex = strategy.orders.findIndex((id) => id === executionData.orderId);

    if (executedOrderIndex !== -1) {
      strategy.orders.splice(executedOrderIndex, 1);

      if (strategy.takeProfitOrderId === executionData.orderId) {
        this.logger.log(
          `Take profit order executed - AccountID: ${accountId} - StrategyID: ${strategy.id} - OrderID: ${executionData.orderId}`
        );
        strategy.takeProfitOrderId = undefined;
      } else if (strategy.stopLossOrderId === executionData.orderId) {
        this.logger.log(
          `Stop loss order executed - AccountID: ${accountId} - StrategyID: ${strategy.id} - OrderID: ${executionData.orderId}`
        );
        strategy.stopLossOrderId = undefined;
      } else {
        this.logger.log(
          `Order executed - AccountID: ${accountId} - StrategyID: ${strategy.id} - OrderID: ${executionData.orderId}`
        );
      }

      await this.process(accountId, strategy, executionData);
    } else {
      this.logger.warn(
        `Order not found in strategy - AccountID: ${accountId} - StrategyID: ${strategy.id} - OrderID: ${executionData.orderId}`
      );
    }
  }

  protected logOrder(
    currencyMode: CurrencyMode,
    marketId: string,
    orderType: string,
    price: number,
    size: number,
    deviation?: number
  ) {
    let logMessage = `Calculated ${orderType} - MarketID: ${marketId} - Price: ${price.toFixed(5)} - Size: ${size.toFixed(8)}`;

    if (currencyMode === CurrencyMode.QUOTE) {
      const sizeInQuote = size * price;
      logMessage += ` ($${sizeInQuote.toFixed(2)})`;
    }

    if (deviation) {
      logMessage += ` - Deviation: ${deviation.toFixed(2)}%`;
    }

    this.logger.debug(logMessage);
  }
}
