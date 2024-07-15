import { Global, Module } from '@nestjs/common';

import { AccountModule } from '@account/account.module';
import { WalletModule } from '@wallet/wallet.module';

import { ExchangeService } from './exchange.service';
import { ExchangeModuleAccountCreatedEventHandler } from './handlers/account-created.exchange.event-handler';
import { ExchangeModuleAccountDeletedEventHandler } from './handlers/account-deleted.exchange.event-handler';
import { ExchangeModuleAccountUpdatedEventHandler } from './handlers/account-updated.exchange.event-handler';
import { ExchangeModuleExchangeInitializedEventHandler } from './handlers/exchange-initiated.event-handler';
import { ExchangeModuleExchangeTerminatedEventHandler } from './handlers/exchange-terminated.event-handler';
import { ExchangeModuleWebSocketSubscribeEventEventHandler } from './handlers/websocket-subscribe.event-handler';
import { ExchangeModuleWebSocketUnsubscribeEventEventHandler } from './handlers/websocket-unsubscribe.event-handler';
import { BybitExchangeService } from './services/bybit-exchange.service';
import { ExchangeFactory } from './services/exchange-service.factory';
import { WebsocketManagerService } from './services/websocket-manager.service';

@Global()
@Module({
  exports: [ExchangeFactory, ExchangeService],
  imports: [AccountModule, WalletModule],
  providers: [
    BybitExchangeService,
    ExchangeFactory,
    ExchangeService,
    ExchangeModuleAccountCreatedEventHandler,
    ExchangeModuleAccountDeletedEventHandler,
    ExchangeModuleAccountUpdatedEventHandler,
    ExchangeModuleExchangeInitializedEventHandler,
    ExchangeModuleExchangeTerminatedEventHandler,
    ExchangeModuleWebSocketSubscribeEventEventHandler,
    ExchangeModuleWebSocketUnsubscribeEventEventHandler,
    WebsocketManagerService
  ]
})
export class ExchangeModule {}
