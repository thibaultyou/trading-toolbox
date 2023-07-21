import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ActionModule } from '../action/action.module';
import { BalanceModule } from '../balance/balance.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { OrderModule } from '../order/order.module';
import { PositionModule } from '../position/position.module';
import { SetupModule } from '../setup/setup.module';
import { TickerModule } from '../ticker/ticker.module';

import { CoreService } from './core.service';

@Module({
  imports: [
    EventEmitterModule,
    BalanceModule,
    ExchangeModule,
    OrderModule,
    PositionModule,
    SetupModule,
    TickerModule,
    ActionModule,
  ],
  providers: [CoreService],
})
export class CoreModule {}
