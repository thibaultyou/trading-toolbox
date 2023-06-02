import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import * as ccxt from 'ccxt';
import { Balances, Exchange, Order } from 'ccxt';
import { WebsocketClient, WSClientConfigurableOptions } from 'bybit-api';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '../app.constants';
import { Account } from '../account/entities/account.entity';
import { TickerUpdateEvent } from '../ticker/events/ticker-update.event';
import { TickerService } from '../ticker/ticker.service';

@Injectable()
export class ExchangeService implements OnModuleInit {
  private exchange: Exchange;
  private ws: WebsocketClient;
  private subscribedTickers = new Set<string>();
  private logger = new Logger(ExchangeService.name);

  constructor(
    private accountService: AccountService,
    private eventEmitter: EventEmitter2,
  ) { }

  async onModuleInit() {
    try {
      const account = await this.getFirstAccount();
      this.initializeExchange(account);
    } catch (error) {
      this.logger.error('Error during module initialization', error.stack);
    }
  }

  private async getFirstAccount() {
    const accounts = await this.accountService.findAll();
    if (accounts.length === 0) {
      this.logger.warn('No account found. Please create an account first.');
      throw new Error('No account found');
    }
    return accounts[0];
  }

  private initializeExchange(account: Account) {
    this.exchange = new ccxt.bybit({
      apiKey: account.key,
      secret: account.secret,
    });
    this.ws = this.initWs(account.key, account.secret);
    this.logger.log('Exchange initialized successfully');
  }

  async initializeWithAccount(account: Account): Promise<void> {
    try {
      this.initializeExchange(account);
    } catch (error) {
      this.logger.error(
        'Error during initialization with account',
        error.stack,
      );
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
    ws.on('update', this.handleWsUpdate.bind(this));
    return ws;
  }

  private handleWsUpdate(msg: any) {
    if (msg.topic && msg.topic.startsWith('tickers.')) {
      this.eventEmitter.emit(
        Events.TICKER_UPDATE,
        new TickerUpdateEvent(msg.topic, msg.data),
      );
    }
  }

  performWsAction(action: string, topic: string, actionDescription: string) {
    try {
      const tickerSymbol = topic.split('.')[1];
      if (action === 'subscribe' && !this.subscribedTickers.has(tickerSymbol)) {
        this.ws[action](topic);
        this.subscribedTickers.add(tickerSymbol);
      } else if (
        action === 'unsubscribe' &&
        this.subscribedTickers.has(tickerSymbol)
      ) {
        this.ws[action](topic);
        this.subscribedTickers.delete(tickerSymbol);
      } else {
        this.logger.warn(`Ignoring ${actionDescription}`);
        return;
      }
      this.logger.log(
        `${actionDescription.charAt(0).toUpperCase() + actionDescription.slice(1)
        } ${topic}`,
      );
    } catch (error) {
      this.logger.error(`Error ${actionDescription}`, error.stack);
    }
  }

  private async getBalances(): Promise<Balances> {
    this.ensureExchangeInitialized();
    try {
      return await this.exchange.fetchBalance();
    } catch (error) {
      this.logger.error('Error fetching balances', error.stack);
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

  async getTickers(): Promise<string[]> {
    this.ensureExchangeInitialized();
    try {
      const markets = await this.exchange.fetchMarkets();
      const usdtPairs = markets
        .filter((market) => market.quote === 'USDT')
        .filter((market) => market.contract)
        .map((market) => market.id)
        .sort();
      return usdtPairs;
    } catch (error) {
      this.logger.error('Error fetching tickers', error.stack);
      throw error;
    }
  }

  async getOpenPositions(): Promise<any> {
    this.ensureExchangeInitialized();
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
    return this.createOrder(
      symbol,
      size,
      'createMarketBuyOrder',
      'opening long order',
    );
  }

  async openShortOrder(symbol: string, size: number): Promise<Order> {
    return this.createOrder(
      symbol,
      size,
      'createMarketSellOrder',
      'opening short order',
    );
  }

  private async createOrder(
    symbol: string,
    size: number,
    orderType: string,
    actionDescription: string,
  ): Promise<Order> {
    this.ensureExchangeInitialized();
    try {
      return await this.exchange[orderType](symbol, size);
    } catch (error) {
      this.logger.error(`Error ${actionDescription}`, error.stack);
    }
  }

  async updateStopLoss(
    orderId: string,
    symbol: string,
    amount: number,
    stopLossPrice: number,
  ): Promise<Order> {
    return this.editOrder(
      orderId,
      symbol,
      'stop_loss',
      'sell',
      amount,
      stopLossPrice,
      'updating stop loss',
    );
  }

  async updateTakeProfit(
    orderId: string,
    symbol: string,
    amount: number,
    takeProfitPrice: number,
  ): Promise<Order> {
    return this.editOrder(
      orderId,
      symbol,
      'take_profit',
      'sell',
      amount,
      takeProfitPrice,
      'updating take profit',
    );
  }

  private async editOrder(
    orderId: string,
    symbol: string,
    type: string,
    side: string,
    amount: number,
    price: number,
    actionDescription: string,
  ): Promise<Order> {
    this.ensureExchangeInitialized();
    try {
      return await this.exchange.editOrder(
        orderId,
        symbol,
        type,
        side,
        amount,
        price,
      );
    } catch (error) {
      this.logger.error(`Error ${actionDescription}`, error.stack);
    }
  }

  async closeOrder(orderId: string, symbol: string): Promise<Order> {
    this.ensureExchangeInitialized();
    try {
      return await this.exchange.cancelOrder(orderId, symbol);
    } catch (error) {
      this.logger.error('Error closing order', error.stack);
    }
  }

  async fetchOpenOrders(): Promise<Order[]> {
    this.ensureExchangeInitialized();
    try {
      return await this.exchange.fetchOpenOrders();
    } catch (error) {
      this.logger.error('Error fetching open orders', error.stack);
    }
  }

  private ensureExchangeInitialized() {
    if (!this.exchange) {
      this.logger.error(
        'Exchange not initialized. Please create an account first.',
      );
      throw new Error('Exchange not initialized');
    }
  }
}
