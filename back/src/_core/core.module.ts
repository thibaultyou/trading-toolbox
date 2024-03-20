import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ActionModule } from 'src/_action/action.module';

import { SetupModule } from '../_setup/setup.module';
import { BalanceModule } from '../features/balance/balance.module';
import { OrderModule } from '../features/order/order.module';
import { PositionModule } from '../features/position/position.module';
import { TickerModule } from '../features/ticker/ticker.module';

import { CoreService } from './core.service';

@Module({
  imports: [
    EventEmitterModule,
    BalanceModule,
    OrderModule,
    PositionModule,
    SetupModule,
    TickerModule,
    ActionModule,
  ],
  providers: [CoreService],
})
export class CoreModule {}
