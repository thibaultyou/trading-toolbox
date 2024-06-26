import { Module } from '@nestjs/common';

import { BalanceModule } from '../balance/balance.module';
import { OrderModule } from '../order/order.module';
import { TickerModule } from '../ticker/ticker.module';
import { StrategyModuleExecutionReceivedEventHandler } from './handlers/execution-received.strategy.event-handler';
import { StrategyFactory } from './strategies/strategy.factory';
import { StrategyService } from './strategy.service';

@Module({
  controllers: [],
  exports: [StrategyService],
  imports: [OrderModule, TickerModule, BalanceModule],
  providers: [StrategyService, StrategyFactory, StrategyModuleExecutionReceivedEventHandler]
})
export class StrategyModule {}
