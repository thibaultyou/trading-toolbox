import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountCreatedEvent } from '@account/events/account-created.event';
import { ConfigService, Events } from '@config';

import { ExchangeService } from '../exchange.service';

@Injectable()
export class ExchangeModuleAccountCreatedEventHandler {
  private readonly logger = new Logger(this.configService.handlers.ExchangeModule);

  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Account.CREATED)
  async handle(event: AccountCreatedEvent) {
    const accountId = event.account.id;
    const actionContext = `${Events.Account.CREATED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      await this.exchangeService.initializeExchange(event.account);
      this.logger.log(`handle() - success | ${actionContext}`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
