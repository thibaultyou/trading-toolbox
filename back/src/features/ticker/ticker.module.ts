import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';
import { PositionModule } from '../position/position.module';
import { TickerModuleExchangeInitializedEventHandler } from './handlers/exchange-initiated.event-handler';
import { TickerModuleExchangeTerminatedEventHandler } from './handlers/exchange-terminated.event-handler';
// import { TickerModuleOrderDataUpdatedEventHandler } from './handlers/_order-data-updated.event-handler';
// import { TickerModulePositionDataUpdatedEventHandler } from './handlers/_position-data-updated.event-handler';
import { TickerModuleTickerUpdatedEventHandler } from './handlers/ticker-data-updated.event-handler';
import { TickerController } from './ticker.controller';
import { TickerService } from './ticker.service';

@Module({
  controllers: [TickerController],
  exports: [TickerService],
  imports: [PositionModule, OrderModule],
  providers: [
    TickerService,
    TickerModuleExchangeInitializedEventHandler,
    TickerModuleExchangeTerminatedEventHandler,
    TickerModuleTickerUpdatedEventHandler
    // TickerModulePositionDataUpdatedEventHandler,
    // TickerModuleOrderDataUpdatedEventHandler
  ]
})
export class TickerModule {}
