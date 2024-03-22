import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { UpdateBalancesEvent } from '../../exchange/events/update-balances.event';
import { BalanceService } from '../balance.service';

@Injectable()
export class BalanceUpdateHandler {
  private logger = new Logger(BalanceUpdateHandler.name);

  constructor(private balanceService: BalanceService) {}

  @OnEvent(Events.UPDATE_BALANCES)
  handle(event: UpdateBalancesEvent) {
    try {
      const accountId = event.accountId;
      // FIXME bring back websocket
      // this.balanceService.updateBalanceFromWebSocket(accountId, null);

      this.logger.log(
        `[${Events.UPDATE_BALANCES}] [${accountId}] ${JSON.stringify(
          event.data,
        )}`,
      );
    } catch (error) {
      this.logger.error('Error handling UpdateBalancesEvent', error.stack);
    }
  }
}
