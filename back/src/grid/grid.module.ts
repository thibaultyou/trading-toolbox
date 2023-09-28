import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AccountModule } from '../account/account.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { OrderModule } from '../order/order.module';
import { PositionModule } from '../position/position.module';
import { TickerModule } from '../ticker/ticker.module';

import { GridService } from './grid.service';
import { OrderExecutedHandler } from './handlers/order-executed.event-handler';

@Module({
  imports: [
    EventEmitterModule,
    AccountModule,
    ExchangeModule,
    PositionModule,
    TickerModule,
    OrderModule,
  ],
  providers: [GridService, OrderExecutedHandler],
})
export class GridModule {}
