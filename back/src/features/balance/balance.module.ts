import { Module } from '@nestjs/common';

import { BalanceController } from './balance.controller';
import { BalanceGateway } from './balance.gateway';
import { BalanceService } from './balance.service';
import { BalanceModuleExchangeInitializedEventHandler } from './handlers/exchange-initiated.event-handler';
import { BalanceModuleExchangeTerminatedEventHandler } from './handlers/exchange-terminated.event-handler';
import { BalanceModuleWalletDataUpdatedEventHandler } from './handlers/wallet-data-updated.event-handler';

@Module({
  controllers: [BalanceController],
  exports: [BalanceService],
  providers: [
    BalanceService,
    BalanceGateway,
    BalanceModuleExchangeInitializedEventHandler,
    BalanceModuleExchangeTerminatedEventHandler,
    BalanceModuleWalletDataUpdatedEventHandler
  ]
})
export class BalanceModule {}
