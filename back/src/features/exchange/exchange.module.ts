import { Global, Module } from '@nestjs/common';

import { BalanceModule } from '../balance/balance.module';
import { ExchangeService } from './exchange.service';
import { ExchangeAccountCreatedEventHandler } from './handlers/account-created.exchange.event-handler';
import { ExchangeAccountDeletedEventHandler } from './handlers/account-deleted.exchange.event-handler';
import { ExchangeAccountUpdatedEventHandler } from './handlers/account-updated.exchange.event-handler';
import { BybitExchangeService } from './services/bybit-exchange.service';
import { ExchangeFactory } from './services/exchange-service.factory';

@Global()
@Module({
  exports: [ExchangeFactory, ExchangeService],
  imports: [BalanceModule],
  providers: [
    BybitExchangeService,
    ExchangeFactory,
    ExchangeService,
    ExchangeAccountCreatedEventHandler,
    ExchangeAccountDeletedEventHandler,
    ExchangeAccountUpdatedEventHandler
  ]
})
export class ExchangeModule {}
