import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ExchangeModule } from '../exchange/exchange.module';
import { TickerModule } from '../ticker/ticker.module';

import { GridService } from './grid.service';

@Module({
  imports: [EventEmitterModule, ExchangeModule, TickerModule],
  providers: [GridService],
})
export class GridModule {}
