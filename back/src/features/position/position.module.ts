import { Module } from '@nestjs/common';

import { PositionExchangeInitializedEventHandler } from './handlers/exchange-initiated.position.event-handler';
import { PositionExchangeTerminatedEventHandler } from './handlers/exchange-terminated.position.event-handler';
import { PositionService } from './position.service';

@Module({
  providers: [
    PositionService,
    PositionExchangeInitializedEventHandler,
    PositionExchangeTerminatedEventHandler,
  ],
  exports: [PositionService],
})
export class PositionModule {}
