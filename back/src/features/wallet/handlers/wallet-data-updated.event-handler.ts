import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext } from '@config/event-handlers.config';
import { Events } from '@config/events.config';
import { WalletDataUpdatedEvent } from '@core/events/wallet-data-updated.event';

import { WalletService } from '../wallet.service';

@Injectable()
export class WalletModuleWalletDataUpdatedEventHandler {
  private logger = new Logger(EventHandlersContext.WalletModuleEventHandler);

  constructor(private walletService: WalletService) {}

  @OnEvent(Events.WALLET_DATA_UPDATED)
  async handle(event: WalletDataUpdatedEvent) {
    const actionContext = `${Events.WALLET_DATA_UPDATED} | AccountID: ${event.accountId}`;

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
