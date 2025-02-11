import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ConfigService, Events } from '@config';
import { ExchangeTerminatedEvent } from '@exchange/events/exchange-terminated.event';

import { PositionService } from '../position.service';

@Injectable()
export class PositionModuleExchangeTerminatedEventHandler {
  private readonly logger = new Logger(this.configService.handlers.PositionModule);

  constructor(
    private readonly positionService: PositionService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Exchange.TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const accountId = event.accountId;
    const actionContext = `${Events.Exchange.TERMINATED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      this.positionService.stopTrackingAccount(accountId);
      this.logger.log(`handle() - success | ${actionContext}, tracking=stopped`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
