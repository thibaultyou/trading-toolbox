import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ConfigService, Events } from '@config';
import { ExchangeInitializedEvent } from '@exchange/events/exchange-initialized.event';

import { WalletService } from '../wallet.service';

@Injectable()
export class WalletModuleExchangeInitializedEventHandler {
  private readonly logger = new Logger(this.configService.handlers.WalletModule);

  constructor(
    private readonly walletService: WalletService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Exchange.INITIALIZED)
  async handle(event: ExchangeInitializedEvent): Promise<void> {
    const accountId = event.accountId;
    const actionContext = `${Events.Exchange.INITIALIZED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      await this.walletService.startTrackingAccount(accountId);
      this.logger.log(`handle() - success | ${actionContext}, tracking=started`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
