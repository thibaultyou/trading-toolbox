import { Module } from '@nestjs/common';
import { ExchangeModule } from '../exchange/exchange.module';
import { CoreService } from './core.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SetupModule } from '../setup/setup.module';
import { BalanceModule } from '../balance/balance.module';
import { OrderModule } from '../order/order.module';
import { PositionModule } from '../position/position.module';
import { TickerModule } from '../ticker/ticker.module';
import { ActionModule } from '../action/action.module';

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
