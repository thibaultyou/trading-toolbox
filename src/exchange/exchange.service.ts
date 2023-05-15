import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import * as ccxt from 'ccxt';
import { Balances, Exchange, Order } from 'ccxt';
import { WebsocketClient, WSClientConfigurableOptions } from 'bybit-api';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TickerUpdateEvent } from '../core/events/ticker-update.event';

@Injectable()
export class ExchangeService implements OnModuleInit {
  private exchange: Exchange;
  private ws: WebsocketClient;
  private logger = new Logger(ExchangeService.name);

  constructor(
    private accountService: AccountService,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    try {
      const accounts = await this.accountService.findAll();
      if (accounts.length > 0) {
        const account = accounts[0];
        this.exchange = new ccxt.bybit({
          apiKey: account.key,
          secret: account.secret,
        });
        this.ws = this.initWs(account.key, account.secret);
        this.logger.log('Exchange initialized successfully');
      } else {
        this.logger.warn('No account found. Please create an account first.');
      }
    } catch (error) {
      this.logger.error('Error during module initialization', error.stack);
    }
  }

  private initWs(apiKey: string, apiSecret: string): WebsocketClient {
    const options: WSClientConfigurableOptions = {
      key: apiKey,
      secret: apiSecret,
      testnet: false,
      market: 'contractUSDT',
    };

    const ws = new WebsocketClient(options);

    // ws.on('response', (msg) => {
    // });

    ws.on('update', (msg) => {
      if (msg.topic && msg.topic.startsWith('tickers.')) {
        this.eventEmitter.emit(
          'ticker.update',
          new TickerUpdateEvent(msg.topic, msg.data),
        );
      }
    });
    // ws.on('error', (msg) => this.logger.error(`WS error: `, msg));

    return ws;
  }

  subscribeTicker(symbol: string): void {
    try {
      this.ws.subscribe(`tickers.${symbol}`);
      this.logger.log(`Subscribed to ${symbol} ticker`);
    } catch (error) {
      this.logger.error('Error subscribing to ticker', error.stack);
    }
  }

  unsubscribeTicker(symbol: string): void {
    try {
      this.ws.unsubscribe(`tickers.${symbol}`);
      this.logger.log(`Unsubscribed from ${symbol} ticker`);
    } catch (error) {
      this.logger.error('Error unsubscribing from ticker', error.stack);
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

  async getBalance(): Promise<number> {
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

  async openLongOrder(symbol: string, size: number): Promise<Order> {
    try {
      return await this.exchange.createMarketBuyOrder(symbol, size);
    } catch (error) {
      this.logger.error('Error opening long order', error.stack);
    }
  }

  async openShortOrder(symbol: string, size: number): Promise<Order> {
    try {
      return await this.exchange.createMarketSellOrder(symbol, size);
    } catch (error) {
      this.logger.error('Error opening short order', error.stack);
    }
  }

  async updateStopLoss(
    orderId: string,
    symbol: string,
    amount: number,
    stopLossPrice: number,
  ): Promise<Order> {
    try {
      return await this.exchange.editOrder(
        orderId,
        symbol,
        'stop_loss',
        'sell',
        amount,
        stopLossPrice,
      );
    } catch (error) {
      this.logger.error('Error updating stop loss', error.stack);
    }
  }

  async updateTakeProfit(
    orderId: string,
    symbol: string,
    amount: number,
    takeProfitPrice: number,
  ): Promise<Order> {
    try {
      return await this.exchange.editOrder(
        orderId,
        symbol,
        'take_profit',
        'sell',
        amount,
        takeProfitPrice,
      );
    } catch (error) {
      this.logger.error('Error updating take profit', error.stack);
    }
  }

  async closeOrder(orderId: string, symbol: string): Promise<Order> {
    try {
      return await this.exchange.cancelOrder(orderId, symbol);
    } catch (error) {
      this.logger.error('Error closing order', error.stack);
    }
  }

  async fetchOpenOrders(): Promise<Order[]> {
    try {
      return await this.exchange.fetchOpenOrders();
    } catch (error) {
      this.logger.error('Error fetching open orders', error.stack);
    }
  }
}
