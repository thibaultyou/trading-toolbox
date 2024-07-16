import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';
import { ExchangeTerminatedEvent } from '@exchange/events/exchange-terminated.event';

import { WalletService } from '../wallet.service';

@Injectable()
export class WalletModuleExchangeTerminatedEventHandler {
  private logger = new Logger(EventHandlersContext.WalletModule);

  constructor(private walletService: WalletService) {}

  @OnEvent(Events.Exchange.TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const actionContext = `${Events.Exchange.TERMINATED} | AccountID: ${event.accountId}`;

    try {
      this.walletService.stopTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from wallet watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
