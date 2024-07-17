import { Module } from '@nestjs/common';

import { AccountModule } from '@account/account.module';

import { WalletModuleExchangeInitializedEventHandler } from './handlers/exchange-initiated.event-handler';
import { WalletModuleExchangeTerminatedEventHandler } from './handlers/exchange-terminated.event-handler';
import { WalletModuleWalletDataUpdatedEventHandler } from './handlers/wallet-data-updated.event-handler';
import { WalletMapperService } from './services/wallet-mapper.service';
import { WalletController } from './wallet.controller';
import { WalletGateway } from './wallet.gateway';
import { WalletService } from './wallet.service';

@Module({
  imports: [AccountModule],
  controllers: [WalletController],
  exports: [WalletService],
  providers: [
    WalletService,
    WalletMapperService,
    WalletGateway,
    WalletModuleExchangeInitializedEventHandler,
    WalletModuleExchangeTerminatedEventHandler,
    WalletModuleWalletDataUpdatedEventHandler
  ]
})
export class WalletModule {}
