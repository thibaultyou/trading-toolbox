import { Injectable, OnModuleInit } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import * as ccxt from 'ccxt';
import { Balances, Exchange } from 'ccxt';
import { AppLogger } from '../logger.service';

@Injectable()
export class ExchangeService implements OnModuleInit {
  private exchange: Exchange;
  private logger = new AppLogger(ExchangeService.name);

  constructor(private accountService: AccountService) {}

  async onModuleInit() {
    try {
      const accounts = await this.accountService.findAll();
      if (accounts.length > 0) {
        const account = accounts[0];
        this.exchange = new ccxt.bybit({
          apiKey: account.key,
          secret: account.secret,
        });
        this.logger.log('Exchange initialized successfully');
      } else {
        this.logger.warn('No account found. Please create an account first.');
      }
    } catch (error) {
      this.logger.error('Error during module initialization', error.stack);
    }
  }

  private async getBalances(): Promise<Balances> {
    if (this.exchange) {
      try {
        return await this.exchange.fetchBalance();
      } catch (error) {
        this.logger.error('Error fetching balances', error.stack);
      }
    } else {
      this.logger.warn('No account found. Please create an account first.');
    }
  }

  async getEquity(): Promise<number> {
    try {
      const balances = await this.getBalances();
      return Number(
        balances?.info?.result?.list?.find((asset) => asset?.coin == 'USDT')
          ?.equity,
      );
    } catch (error) {
      this.logger.error('Error fetching equity', error.stack);
    }
  }

  async getOpenPositions(): Promise<any> {
    if (this.exchange?.has?.fetchPositions) {
      try {
        return await this.exchange.fetchPositions();
      } catch (error) {
        this.logger.error('Error fetching open positions', error.stack);
      }
    } else {
      this.logger.warn('fetchPositions not supported on this exchange');
    }
  }
}
