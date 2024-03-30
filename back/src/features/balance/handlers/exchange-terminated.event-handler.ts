import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { ExchangeTerminatedEvent } from '../../exchange/events/exchange-terminated.event';
import { BalanceService } from '../balance.service';

@Injectable()
export class BalanceModuleExchangeTerminatedEventHandler {
  private logger = new Logger(BalanceModuleExchangeTerminatedEventHandler.name);

  constructor(private balanceService: BalanceService) {}

  @OnEvent(Events.EXCHANGE_TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const actionContext = `Event: EXCHANGE_TERMINATED - AccountID: ${event.accountId}`;

    try {
      this.balanceService.stopTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from balance watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
