import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ExchangeModule } from '../exchange/exchange.module'; // Assuming you have ExchangeModule that provides ExchangeService

import { BalanceService } from './balance.service';

@Module({
  imports: [EventEmitterModule, ExchangeModule],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
