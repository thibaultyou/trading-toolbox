import { Module } from '@nestjs/common';
import { ExchangeModule } from '../exchange/exchange.module';
import { TickerService } from './ticker.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TickerUpdateHandler } from './handlers/ticker-update.event-handler';
import { SetupCreatedHandler } from './handlers/setup-created.event-handler';
import { SetupModule } from '../setup/setup.module';
import { TickerController } from './ticker.controller';

@Module({
  imports: [EventEmitterModule, ExchangeModule, SetupModule],
  providers: [TickerUpdateHandler, SetupCreatedHandler, TickerService],
  controllers: [TickerController],
  exports: [TickerService],
})
export class TickerModule {}
