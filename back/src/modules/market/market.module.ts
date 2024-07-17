import { Module } from '@nestjs/common';

import { AccountModule } from '@account/account.module';

import { MarketModuleExchangeInitializedEventHandler } from './handlers/exchange-initiated.event-handler';
import { MarketModuleExchangeTerminatedEventHandler } from './handlers/exchange-terminated.event-handler';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { MarketMapperService } from './services/market-mapper.service';

@Module({
  controllers: [MarketController],
  exports: [MarketService],
  imports: [AccountModule],
  providers: [
    MarketService,
    MarketMapperService,
    MarketModuleExchangeInitializedEventHandler,
    MarketModuleExchangeTerminatedEventHandler
  ]
})
export class MarketModule {}
