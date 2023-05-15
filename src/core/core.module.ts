import { Module } from '@nestjs/common';
import { ExchangeModule } from '../exchange/exchange.module';
import { CoreService } from './core.service';
import { BalanceService } from './balance.service';
import { PositionService } from './position.service';
import { TickerService } from './ticker.service';
import { TickerUpdateHandler } from './handlers/ticker-update.event-handler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OrderService } from './order.service';

@Module({
  imports: [EventEmitterModule, ExchangeModule],
  providers: [
    CoreService,
    BalanceService,
    OrderService,
    PositionService,
    TickerUpdateHandler,
    TickerService,
  ],
})
export class CoreModule {}
