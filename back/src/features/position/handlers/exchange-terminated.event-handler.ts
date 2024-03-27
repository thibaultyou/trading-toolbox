import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { ExchangeTerminatedEvent } from '../../exchange/events/exchange-terminated.event';
import { PositionService } from '../position.service';

@Injectable()
export class PositionModuleExchangeTerminatedEventHandler {
  private logger = new Logger(PositionModuleExchangeTerminatedEventHandler.name);

  constructor(private positionService: PositionService) {}

  @OnEvent(Events.EXCHANGE_TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const actionContext = `Position Module - Event: EXCHANGE_TERMINATED - AccountID: ${event.accountId}`;

    try {
      this.positionService.stopTrackingAccount(event.accountId);
      this.logger.log(`${actionContext} - Removed account from position watch list`);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from position watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
