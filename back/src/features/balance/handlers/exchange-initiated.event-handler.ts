import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { ExchangeInitializedEvent } from '../../exchange/events/exchange-initialized.event';
import { BalanceService } from '../balance.service';

@Injectable()
export class BalanceModuleExchangeInitializedEventHandler {
  private logger = new Logger(BalanceModuleExchangeInitializedEventHandler.name);

  constructor(private balanceService: BalanceService) {}

  @OnEvent(Events.EXCHANGE_INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `Balance Module - Event: EXCHANGE_INITIALIZED - AccountID: ${event.accountId}`;

    try {
      await this.balanceService.startTrackingAccount(event.accountId);
      this.logger.log(`${actionContext} - Added account to balance watch list`);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to balance watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
