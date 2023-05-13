import { Injectable, OnModuleInit } from '@nestjs/common';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class CoreService implements OnModuleInit {
    private tradingIntervalId: NodeJS.Timeout;
    private equity: number;

    constructor(private exchangeService: ExchangeService) { }

    async onModuleInit() {
        await this.updateEquity()
        this.tradingIntervalId = setInterval(() => {
            this.updateEquity()
        }, 30000);
    }

    private async updateEquity() {
        this.equity = await this.exchangeService.getEquity()
    }
}
