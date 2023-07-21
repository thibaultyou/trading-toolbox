import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ExchangeModule } from '../exchange/exchange.module'; // Assuming you have ExchangeModule that provides ExchangeService

import { OrderService } from './order.service';

@Module({
  imports: [EventEmitterModule, ExchangeModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
