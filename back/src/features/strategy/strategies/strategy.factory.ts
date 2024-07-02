import { Injectable } from '@nestjs/common';

import { OrderService } from '../../order/order.service';
import { TickerService } from '../../ticker/ticker.service';
import { WalletService } from '../../wallet/wallet.service';
import { StrategyType } from '../types/strategy-type.enum';
import { StrategyOptionsValidator } from '../validators/strategy-options.validator';
import { BaseStrategy } from './base-strategy';
import { FibonacciMartingaleStrategy } from './fibonacci-martingale-strategy';
import { UnknownStrategyTypeException } from '../exceptions/strategy.exceptions';

@Injectable()
export class StrategyFactory {
  constructor(
    private orderService: OrderService,
    private tickerService: TickerService,
    private walletService: WalletService,
    private optionsValidator: StrategyOptionsValidator
  ) {}

  createStrategy(type: StrategyType): BaseStrategy {
    switch (type) {
      case StrategyType.FIBONACCI_MARTINGALE:
        return new FibonacciMartingaleStrategy(
          this.orderService,
          this.tickerService,
          this.walletService,
          this.optionsValidator
        );
      default:
        throw new UnknownStrategyTypeException(type);
    }
  }
}