import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AccountModule } from '../account/account.module';
import { ExchangeModule } from '../exchange/exchange.module'; // Assuming you have ExchangeModule that provides ExchangeService

import { OrderService } from './order.service';

@Module({
  imports: [EventEmitterModule, ExchangeModule, AccountModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
