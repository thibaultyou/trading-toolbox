import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { ExchangeInitializedEvent } from '../../exchange/events/exchange-initialized.event';
import { PositionService } from '../position.service';

@Injectable()
export class PositionModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.PositionModuleEventHandler);

  constructor(private positionService: PositionService) {}

  @OnEvent(Events.EXCHANGE_INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `${Events.EXCHANGE_INITIALIZED} | AccountID: ${event.accountId}`;

    try {
      await this.positionService.startTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to position watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
