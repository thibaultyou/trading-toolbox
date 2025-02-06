import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';
import { ExchangeTerminatedEvent } from '@exchange/events/exchange-terminated.event';

import { WalletService } from '../wallet.service';

@Injectable()
export class WalletModuleExchangeTerminatedEventHandler {
  private readonly logger = new Logger(EventHandlersContext.WalletModule);

  constructor(private readonly walletService: WalletService) {}

  @OnEvent(Events.Exchange.TERMINATED)
  handle(event: ExchangeTerminatedEvent): void {
    const accountId = event.accountId;
    const actionContext = `${Events.Exchange.TERMINATED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      this.walletService.stopTrackingAccount(accountId);
      this.logger.log(`handle() - success | ${actionContext}, tracking=stopped`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
