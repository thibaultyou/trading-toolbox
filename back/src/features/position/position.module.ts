import { Module } from '@nestjs/common';

import { PositionModuleExchangeInitializedEventHandler } from './handlers/exchange-initiated.event-handler';
import { PositionModuleExchangeTerminatedEventHandler } from './handlers/exchange-terminated.event-handler';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';

@Module({
  controllers: [PositionController],
  exports: [PositionService],
  providers: [
    PositionService,
    PositionModuleExchangeInitializedEventHandler,
    PositionModuleExchangeTerminatedEventHandler
  ]
})
export class PositionModule {}
