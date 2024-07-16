import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';
import { ExchangeInitializedEvent } from '@exchange/events/exchange-initialized.event';

import { WalletService } from '../wallet.service';

@Injectable()
export class WalletModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.WalletModule);

  constructor(private walletService: WalletService) {}

  @OnEvent(Events.Exchange.INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `${Events.Exchange.INITIALIZED} | AccountID: ${event.accountId}`;

    try {
      await this.walletService.startTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to wallet watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
