import { Module } from '@nestjs/common';

import { AccountModule } from '../account/account.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { CoreService } from './core.service';
import { CoreModuleExchangeInitializedEventHandler } from './handlers/exchange-initiated.event-handler';
import { CoreModuleExchangeTerminatedEventHandler } from './handlers/exchange-terminated.event-handler';
import { CoreModuleWebSocketSubscribeEventEventHandler } from './handlers/websocket-subscribe.event-handler';
import { CoreModuleWebSocketUnsubscribeEventEventHandler } from './handlers/websocket-unsubscribe.event-handler';
import { WebsocketManagerService } from './services/websocket-manager.service';

@Module({
  exports: [WebsocketManagerService],
  imports: [AccountModule, ExchangeModule],
  providers: [
    CoreService,
    WebsocketManagerService,
    CoreModuleExchangeInitializedEventHandler,
    CoreModuleExchangeTerminatedEventHandler,
    CoreModuleWebSocketSubscribeEventEventHandler,
    CoreModuleWebSocketUnsubscribeEventEventHandler
  ]
})
export class CoreModule {}
