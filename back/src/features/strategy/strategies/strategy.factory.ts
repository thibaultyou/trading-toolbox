import { Injectable } from '@nestjs/common';

import { BalanceService } from '../../balance/balance.service';
import { OrderService } from '../../order/order.service';
import { TickerService } from '../../ticker/ticker.service';
import { StrategyType } from '../types/strategy-type.enum';
import { BaseStrategy } from './base-strategy';
import { FibonacciMartingaleStrategy } from './fibonacci-martingale-strategy';

@Injectable()
export class StrategyFactory {
  constructor(
    private orderService: OrderService,
    private tickerService: TickerService,
    private balanceService: BalanceService
  ) {}

  createStrategy(type: StrategyType): BaseStrategy {
    switch (type) {
      case StrategyType.FIBONACCI_MARTINGALE:
        return new FibonacciMartingaleStrategy(this.orderService, this.tickerService, this.balanceService);
      default:
        throw new Error(`Unknown strategy type: ${type}`);
    }
  }
}
