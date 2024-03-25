import { Module } from '@nestjs/common';

import { OrderExchangeInitializedEventHandler } from './handlers/exchange-initiated.order.event-handler';
import { OrderExchangeTerminatedEventHandler } from './handlers/exchange-terminated.order.event-handler';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  exports: [OrderService],
  providers: [OrderService, OrderExchangeInitializedEventHandler, OrderExchangeTerminatedEventHandler]
})
export class OrderModule {}
