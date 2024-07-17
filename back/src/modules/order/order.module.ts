import { Module } from '@nestjs/common';

import { AccountModule } from '@account/account.module';

import { OrderModuleExchangeInitializedEventHandler } from './handlers/exchange-initiated.event-handler';
import { OrderModuleExchangeTerminatedEventHandler } from './handlers/exchange-terminated.event-handler';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderMapperService } from './services/order-mapper.service';

@Module({
  imports: [AccountModule],
  controllers: [OrderController],
  exports: [OrderService, OrderMapperService],
  providers: [
    OrderService,
    OrderMapperService,
    OrderModuleExchangeInitializedEventHandler,
    OrderModuleExchangeTerminatedEventHandler
  ]
})
export class OrderModule {}
