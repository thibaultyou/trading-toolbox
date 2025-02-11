import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountUpdatedEvent } from '@account/events/account-updated.event';
import { ConfigService, Events } from '@config';

import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeModuleAccountUpdatedEventHandler {
  private readonly logger = new Logger(this.configService.handlers.ExchangeModule);

  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Account.UPDATED)
  async handle(event: AccountUpdatedEvent) {
    const accountId = event.account.id;
    const actionContext = `${Events.Account.UPDATED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start (cleanup) | ${actionContext}`);

    try {
      await this.exchangeService.cleanResources(accountId);
      this.logger.log(`handle() - success (cleanup) | ${actionContext}`);
    } catch (error) {
      this.logger.error(`handle() - error (cleanup) | ${actionContext}, msg=${error.message}`, error.stack);
    }

    this.logger.debug(`handle() - start (re-init) | ${actionContext}`);

    try {
      await this.exchangeService.initializeExchange(event.account);
      this.logger.log(`handle() - success (re-init) | ${actionContext}`);
    } catch (error) {
      this.logger.error(`handle() - error (re-init) | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
