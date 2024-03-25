import { Module } from '@nestjs/common';

import { AccountModule } from '../account/account.module';
import { MarketExchangeInitializedEventHandler } from './handlers/exchange-initiated.market.event-handler';
import { MarketExchangeTerminatedEventHandler } from './handlers/exchange-terminated.market.event-handler';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

@Module({
  controllers: [MarketController],
  exports: [MarketService],
  imports: [AccountModule],
  providers: [MarketService, MarketExchangeInitializedEventHandler, MarketExchangeTerminatedEventHandler]
})
export class MarketModule {}
