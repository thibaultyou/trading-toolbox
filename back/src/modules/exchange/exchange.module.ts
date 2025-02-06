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
import { BybitExchangeService } from './services/bybit/bybit-exchange.service';
import { BitgetExchangeService } from './services/bitget/bitget-exchange.service';
import { ExchangeFactory } from './services/exchange-service.factory';
import { BybitWebsocketManagerService } from './services/bybit/bybit-websocket-manager.service';
import { BitgetWebsocketManagerService } from './services/bitget/bitget-websocket-manager.service';
import { ExchangeWebsocketFactory } from './services/exchange-websocket-factory';
import { BitgetMapperService } from './services/bitget/bitget-mapper.service';

@Global()
@Module({
  exports: [ExchangeFactory, ExchangeService, ExchangeWebsocketFactory],
  imports: [AccountModule, WalletModule],
  providers: [
    BybitExchangeService,
    BitgetExchangeService,
    BitgetMapperService,
    BitgetWebsocketManagerService,
    ExchangeFactory,
    BybitWebsocketManagerService,
    ExchangeWebsocketFactory,
    ExchangeService,
    ExchangeModuleAccountCreatedEventHandler,
    ExchangeModuleAccountDeletedEventHandler,
    ExchangeModuleAccountUpdatedEventHandler,
    ExchangeModuleExchangeInitializedEventHandler,
    ExchangeModuleExchangeTerminatedEventHandler,
    ExchangeModuleWebSocketSubscribeEventEventHandler,
    ExchangeModuleWebSocketUnsubscribeEventEventHandler
  ]
})
export class ExchangeModule {}
