import { Injectable, OnModuleInit } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import * as ccxt from 'ccxt';
import { Balances, Exchange } from 'ccxt';

@Injectable()
export class ExchangeService implements OnModuleInit {
    private exchange: Exchange;

    constructor(private accountService: AccountService) { }

    async onModuleInit() {
        // TODO change this
        const accounts = await this.accountService.findAll();
        if (accounts.length > 0) {
            const account = accounts[0];
            this.exchange = new ccxt.bybit({
                apiKey: account.key,
                secret: account.secret
            });
        } else {
            console.log('No account found. Please create an account first.');
        }
    }

    private async getBalances(): Promise<Balances> {
        if (this.exchange) {
            return this.exchange.fetchBalance();
        } else {
            console.log('No account found. Please create an account first.');
        }
    }

    async getEquity(): Promise<number> {
        return Number((await this.getBalances())?.info?.result?.list?.find(asset => asset?.coin == "USDT").equity)
    }
}
