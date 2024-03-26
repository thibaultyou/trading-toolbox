import { Module } from '@nestjs/common';

import { TickerExchangeTerminatedEventHandler } from './handlers/exchange-terminated.ticker.event-handler';
import { TickerOrdersUpdatedEventHandler } from './handlers/orders-updated.ticker.event-handler';
import { TickerPositionsUpdatedEventHandler } from './handlers/positions-updated.ticker.event-handler';
import { TickerController } from './ticker.controller';
import { TickerService } from './ticker.service';

@Module({
  controllers: [TickerController],
  exports: [TickerService],
  providers: [
    TickerService,
    TickerExchangeTerminatedEventHandler,
    TickerOrdersUpdatedEventHandler,
    TickerPositionsUpdatedEventHandler
  ]
})
export class TickerModule {}
