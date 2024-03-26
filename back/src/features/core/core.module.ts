import { Module } from '@nestjs/common';

import { AccountModule } from '../account/account.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { CoreService } from './core.service';
import { CoreExchangeInitializedEventHandler } from './handlers/exchange-initiated.core.event-handler';
import { CoreExchangeTerminatedEventHandler } from './handlers/exchange-terminated.core.event-handler';
import { CoreTickersUpdatedEventHandler } from './handlers/tickers-updated.core.event-handler';
import { WebsocketManagerService } from './services/websocket-manager.service';

@Module({
  exports: [WebsocketManagerService],
  imports: [AccountModule, ExchangeModule],
  providers: [
    CoreService,
    WebsocketManagerService,
    CoreExchangeInitializedEventHandler,
    CoreExchangeTerminatedEventHandler,
    CoreTickersUpdatedEventHandler
  ]
})
export class CoreModule {}
