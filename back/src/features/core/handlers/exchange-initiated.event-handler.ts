import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { ExchangeInitializedEvent } from '../../exchange/events/exchange-initialized.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class CoreModuleExchangeInitializedEventHandler {
  private logger = new Logger(CoreModuleExchangeInitializedEventHandler.name);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.EXCHANGE_INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `Core Module - Event: EXCHANGE_INITIALIZED - AccountID: ${event.accountId}`;

    try {
      await this.websocketManagerService.startTrackingAccount(event.accountId);
      this.logger.log(`${actionContext} - Added account to websocket manager`);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to websocket manager - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
