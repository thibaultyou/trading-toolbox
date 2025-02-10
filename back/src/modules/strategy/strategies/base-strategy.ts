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
    protected readonly orderService: OrderService,
    protected readonly tickerService: TickerService,
    protected readonly walletService: WalletService,
    protected readonly optionsValidator: StrategyOptionsValidator
  ) {}

  abstract process(accountId: string, strategy: IStrategy, executionData?: IExecutionData): Promise<void>;

  protected validateStrategyOptions(type: StrategyType, options: any): boolean {
    return this.optionsValidator.validateOptions(type, options);
  }

  async handleOrderExecution(accountId: string, strategy: IStrategy, executionData: IExecutionData) {
    this.logger.debug(
      `handleOrderExecution() - start | accountId=${accountId}, strategyId=${strategy.id}, orderId=${executionData.orderId}`
    );

    const executedOrderIndex = strategy.orders.findIndex((id) => id === executionData.orderId);

    if (executedOrderIndex !== -1) {
      strategy.orders.splice(executedOrderIndex, 1);

      if (strategy.takeProfitOrderId === executionData.orderId) {
        this.logger.log(
          `handleOrderExecution() - success (takeProfitExecuted) | accountId=${accountId}, strategyId=${strategy.id}, orderId=${executionData.orderId}`
        );
        strategy.takeProfitOrderId = undefined;
      } else if (strategy.stopLossOrderId === executionData.orderId) {
        this.logger.log(
          `handleOrderExecution() - success (stopLossExecuted) | accountId=${accountId}, strategyId=${strategy.id}, orderId=${executionData.orderId}`
        );
        strategy.stopLossOrderId = undefined;
      } else {
        this.logger.log(
          `handleOrderExecution() - success (otherOrderExecuted) | accountId=${accountId}, strategyId=${strategy.id}, orderId=${executionData.orderId}`
        );
      }

      await this.process(accountId, strategy, executionData);
    } else {
      this.logger.warn(
        `handleOrderExecution() - skip | reason=OrderNotFoundInStrategy, accountId=${accountId}, strategyId=${strategy.id}, orderId=${executionData.orderId}`
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
    let msg = `Calculated ${orderType} | marketId=${marketId}, price=${price.toFixed(5)}, size=${size.toFixed(8)}`;

    if (currencyMode === CurrencyMode.QUOTE) {
      const sizeInQuote = size * price;
      msg += ` (quoteVolume=$${sizeInQuote.toFixed(2)})`;
    }

    if (deviation) {
      msg += `, deviation=${deviation.toFixed(2)}%`;
    }

    this.logger.debug(`logOrder() - ${msg}`);
  }
}
