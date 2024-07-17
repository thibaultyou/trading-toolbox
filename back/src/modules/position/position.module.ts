import { Module } from '@nestjs/common';

import { AccountModule } from '@account/account.module';
import { OrderModule } from '@order/order.module';

import { PositionModuleExchangeInitializedEventHandler } from './handlers/exchange-initiated.event-handler';
import { PositionModuleExchangeTerminatedEventHandler } from './handlers/exchange-terminated.event-handler';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import { PositionMapperService } from './services/position-mapper.service';

@Module({
  imports: [AccountModule, OrderModule],
  controllers: [PositionController],
  exports: [PositionService],
  providers: [
    PositionService,
    PositionMapperService,
    PositionModuleExchangeInitializedEventHandler,
    PositionModuleExchangeTerminatedEventHandler
  ]
})
export class PositionModule {}
