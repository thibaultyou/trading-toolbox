import { Injectable, OnModuleInit } from '@nestjs/common';

import { AccountService } from '../account/account.service';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class CoreService implements OnModuleInit {
  constructor(
    private accountService: AccountService,
    private exchangeService: ExchangeService
  ) {}

  async onModuleInit() {
    const accounts = await this.accountService.getAllAccounts();
    // NOTE 1s delay to allow other modules to init and listen to exchange events
    setTimeout(async () => {
      await Promise.all(accounts.map((account) => this.exchangeService.initializeExchange(account)));
    }, 1000);
  }
}
