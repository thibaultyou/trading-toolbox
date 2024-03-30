import { Module } from '@nestjs/common';

import { TickerModuleExchangeTerminatedEventHandler } from './handlers/exchange-terminated.event-handler';
import { TickerModuleOrdersUpdatedEventHandler } from './handlers/orders-updated.event-handler';
import { TickerModulePositionsUpdatedEventHandler } from './handlers/positions-updated.event-handler';
import { TickerModuleTickerUpdatedEventHandler } from './handlers/ticker-data-updated.event-handler';
import { TickerController } from './ticker.controller';
import { TickerService } from './ticker.service';

@Module({
  controllers: [TickerController],
  exports: [TickerService],
  providers: [
    TickerService,
    TickerModuleExchangeTerminatedEventHandler,
    TickerModuleOrdersUpdatedEventHandler,
    TickerModulePositionsUpdatedEventHandler,
    TickerModuleTickerUpdatedEventHandler
  ]
})
export class TickerModule {}
