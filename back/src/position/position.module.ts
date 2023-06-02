import { Module } from '@nestjs/common';
import { PositionService } from './position.service';
import { ExchangeModule } from '../exchange/exchange.module'; // Assuming you have ExchangeModule that provides ExchangeService
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule, ExchangeModule],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
