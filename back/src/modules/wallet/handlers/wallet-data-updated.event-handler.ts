import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';
import { WalletDataUpdatedEvent } from '@exchange/events/wallet-data-updated.event';

import { WalletService } from '../wallet.service';

@Injectable()
export class WalletModuleWalletDataUpdatedEventHandler {
  private logger = new Logger(EventHandlersContext.WalletModule);

  constructor(private walletService: WalletService) {}

  @OnEvent(Events.Data.WALLET_UPDATED)
  async handle(event: WalletDataUpdatedEvent) {
    const actionContext = `${Events.Data.WALLET_UPDATED} | AccountID: ${event.accountId}`;

    try {
      for (const walletData of event.data) {
        this.walletService.processWalletData(event.accountId, walletData);
      }
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to process wallet update data - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
