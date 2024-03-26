import { Module } from '@nestjs/common';

import { TickerOrdersUpdatedEventHandler } from './handlers/orders-updated.ticker.event-handler';
import { TickerPositionsUpdatedEventHandler } from './handlers/positions-updated.ticker.event-handler';
import { TickerController } from './ticker.controller';
import { TickerService } from './ticker.service';

@Module({
  controllers: [TickerController],
  exports: [TickerService],
  providers: [TickerService, TickerOrdersUpdatedEventHandler, TickerPositionsUpdatedEventHandler]
})
export class TickerModule {}
