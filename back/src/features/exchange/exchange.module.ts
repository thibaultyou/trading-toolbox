import { Global, Module } from '@nestjs/common';

import { BalanceModule } from '../balance/balance.module';
import { ExchangeService } from './exchange.service';
import { BybitExchangeService } from './services/bybit-exchange.service';
import { ExchangeFactory } from './services/exchange-service.factory';

@Global()
@Module({
  imports: [BalanceModule],
  providers: [BybitExchangeService, ExchangeFactory, ExchangeService],
  exports: [ExchangeFactory, ExchangeService],
})
export class ExchangeModule {}
