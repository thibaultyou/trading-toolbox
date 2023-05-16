import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { ExchangeModule } from '../exchange/exchange.module'; // Assuming you have ExchangeModule that provides ExchangeService
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule, ExchangeModule],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
