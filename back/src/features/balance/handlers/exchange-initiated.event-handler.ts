import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { ExchangeInitializedEvent } from '../../exchange/events/exchange-initialized.event';
import { BalanceService } from '../balance.service';

@Injectable()
export class BalanceModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.BalanceModuleEventHandler);

  constructor(private balanceService: BalanceService) {}

  @OnEvent(Events.EXCHANGE_INITIALIZED)
  async handle(event: ExchangeInitializedEvent): Promise<void> {
    const actionContext = `${Events.EXCHANGE_INITIALIZED} | AccountID: ${event.accountId}`;

    try {
      await this.balanceService.startTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to balance watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
