import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AccountModule } from '../account/account.module';

import { ExchangeService } from './exchange.service';
import { AccountCreatedHandler } from './handlers/account-created.event-handler';
import { BybitExchangeService } from './services/bybit-exchange.service';
import { ExchangeFactory } from './services/exchange-service.factory';
import { MexcExchangeService } from './services/mexc-exchange.service';

@Module({
  imports: [EventEmitterModule, AccountModule],
  providers: [
    BybitExchangeService,
    MexcExchangeService,
    ExchangeFactory,
    AccountCreatedHandler,
    ExchangeService,
  ],
  exports: [ExchangeFactory, ExchangeService],
})
export class ExchangeModule {}
