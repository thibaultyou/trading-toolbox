import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ConfigService, Events } from '@config';
import { ExchangeTerminatedEvent } from '@exchange/events/exchange-terminated.event';

import { MarketService } from '../market.service';

@Injectable()
export class MarketModuleExchangeTerminatedEventHandler {
  private logger = new Logger(this.configService.handlers.MarketModule);

  constructor(
    private marketService: MarketService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Exchange.TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    this.logger.debug(`handle() - start | event=${Events.Exchange.TERMINATED}, accountId=${event.accountId}`);

    try {
      this.marketService.stopTrackingAccount(event.accountId);
      this.logger.log(`handle() - success | event=${Events.Exchange.TERMINATED}, accountId=${event.accountId}`);
    } catch (error) {
      this.logger.error(
        `handle() - error | event=${Events.Exchange.TERMINATED}, accountId=${event.accountId}, msg=${error.message}`,
        error.stack
      );
    }
  }
}
