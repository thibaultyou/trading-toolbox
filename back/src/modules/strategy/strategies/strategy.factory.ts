import { Injectable, Logger } from '@nestjs/common';

import { OrderService } from '@order/order.service';
import { TickerService } from '@ticker/ticker.service';
import { WalletService } from '@wallet/wallet.service';

import { BaseStrategy } from './base-strategy';
import { FibonacciMartingaleStrategy } from './fibonacci-martingale-strategy';
import { UnknownStrategyTypeException } from '../exceptions/strategy.exceptions';
import { StrategyType } from '../types/strategy-type.enum';
import { StrategyOptionsValidator } from '../validators/strategy-options.validator';

@Injectable()
export class StrategyFactory {
  private readonly logger = new Logger(StrategyFactory.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly tickerService: TickerService,
    private readonly walletService: WalletService,
    private readonly optionsValidator: StrategyOptionsValidator
  ) {}

  createStrategy(type: StrategyType): BaseStrategy {
    this.logger.debug(`createStrategy() - start | type=${type}`);

    switch (type) {
      case StrategyType.FIBONACCI_MARTINGALE: {
        this.logger.log(`createStrategy() - success | type=${type}, strategy=FibonacciMartingale`);
        return new FibonacciMartingaleStrategy(
          this.orderService,
          this.tickerService,
          this.walletService,
          this.optionsValidator
        );
      }
      default: {
        this.logger.error(`createStrategy() - error | unknownType=${type}`);
        throw new UnknownStrategyTypeException(type);
      }
    }
  }
}
