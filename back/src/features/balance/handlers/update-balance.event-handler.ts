import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { UpdateBalanceEvent } from '../../exchange/events/update-balance.event';
import { BalanceService } from '../balance.service';

@Injectable()
export class BalanceUpdateHandler {
  private logger = new Logger(BalanceUpdateHandler.name);

  constructor(private balanceService: BalanceService) {}

  @OnEvent(Events.UPDATE_BALANCE)
  handle(event: UpdateBalanceEvent) {
    try {
      const accountName = event.accountName;
      const balance = parseFloat(event.data[0].coin[0].equity);

      this.balanceService.updateBalanceFromWebSocket(accountName, balance);

      this.logger.debug(
        `[${Events.UPDATE_BALANCE}] [${accountName}] ${JSON.stringify(
          event.data,
        )}`,
      );
    } catch (error) {
      this.logger.error('Error handling UpdateBalanceEvent', error.stack);
    }
  }
}
