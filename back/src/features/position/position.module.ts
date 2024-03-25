import { Module } from '@nestjs/common';

import { PositionExchangeInitializedEventHandler } from './handlers/exchange-initiated.position.event-handler';
import { PositionExchangeTerminatedEventHandler } from './handlers/exchange-terminated.position.event-handler';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';

@Module({
  controllers: [PositionController],
  exports: [PositionService],
  providers: [PositionService, PositionExchangeInitializedEventHandler, PositionExchangeTerminatedEventHandler]
})
export class PositionModule {}
