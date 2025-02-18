import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountDeletedEvent } from '@account/events/account-deleted.event';
import { ConfigService, Events } from '@config';

import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeModuleAccountDeletedEventHandler {
  private readonly logger = new Logger(this.configService.handlers.ExchangeModule);

  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Account.DELETED)
  async handle(event: AccountDeletedEvent) {
    const accountId = event.account.id;
    const actionContext = `${Events.Account.DELETED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      await this.exchangeService.cleanResources(accountId, event.account.exchange);
      this.logger.log(`handle() - success | ${actionContext}`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
