import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { ExchangeInitializedEvent } from '../../exchange/events/exchange-initialized.event';
import { PositionService } from '../position.service';

@Injectable()
export class PositionExchangeInitializedEventHandler {
  private logger = new Logger(PositionExchangeInitializedEventHandler.name);

  constructor(private positionService: PositionService) {}

  @OnEvent(Events.EXCHANGE_INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `Position Module - Event: EXCHANGE_INITIALIZED - AccountID: ${event.accountId}`;

    try {
      this.positionService.addAccount(event.accountId);
      this.logger.log(
        `${actionContext} - Added to position watch list`,
      );
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add to position watch list - Error: ${error.message}`,
        error.stack,
      );
    }
  }
}
