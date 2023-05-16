import { Module } from '@nestjs/common';
import { ExchangeModule } from '../exchange/exchange.module';
import { TickerService } from './ticker.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TickerUpdateHandler } from './handlers/ticker-update.event-handler';

@Module({
  imports: [EventEmitterModule, ExchangeModule],
  providers: [TickerUpdateHandler, TickerService],
  exports: [TickerService],
})
export class TickerModule {}
