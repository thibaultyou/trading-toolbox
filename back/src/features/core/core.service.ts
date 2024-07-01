import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { AccountService } from '../account/account.service';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class CoreService implements OnModuleInit {
  private logger = new Logger(CoreService.name);

  constructor(
    private accountService: AccountService,
    private exchangeService: ExchangeService
  ) {}

  async onModuleInit() {
    this.logger.debug('Initializing module');
    const accounts = await this.accountService.getAllAccounts();
    this.logger.debug(`Fetched accounts for initialization - Count: ${accounts.length}`);
    // NOTE 1s delay to allow other modules to init and listen to exchange events
    setTimeout(async () => {
      await Promise.all(accounts.map((account) => this.exchangeService.initializeExchange(account)));
    }, 1000);
    this.logger.log('Module initialized successfully');
  }
}
