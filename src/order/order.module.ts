import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { ExchangeModule } from '../exchange/exchange.module'; // Assuming you have ExchangeModule that provides ExchangeService
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule, ExchangeModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
