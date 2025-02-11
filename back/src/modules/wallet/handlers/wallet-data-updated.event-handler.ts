import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events, ConfigService } from '@config';
import { WalletDataUpdatedEvent } from '@exchange/events/wallet-data-updated.event';

import { WalletService } from '../wallet.service';

@Injectable()
export class WalletModuleWalletDataUpdatedEventHandler {
  private readonly logger = new Logger(this.configService.handlers.WalletModule);

  constructor(
    private readonly walletService: WalletService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Data.WALLET_UPDATED)
  async handle(event: WalletDataUpdatedEvent): Promise<void> {
    const accountId = event.accountId;
    const actionContext = `${Events.Data.WALLET_UPDATED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      for (const walletData of event.data) {
        this.walletService.processWalletData(accountId, walletData);
      }
      this.logger.log(`handle() - success | ${actionContext}`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
