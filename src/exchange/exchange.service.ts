import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import * as ccxt from 'ccxt';
import { Balances, Exchange, Order } from 'ccxt';
import { WebsocketClient, WSClientConfigurableOptions } from 'bybit-api';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '../app.constants';
import { Account } from '../account/entities/account.entity';
import { TickerUpdateEvent } from '../ticker/events/ticker-update.event';

@Injectable()
export class ExchangeService implements OnModuleInit {
  private exchange: Exchange;
  private ws: WebsocketClient;
  private logger = new Logger(ExchangeService.name);

  constructor(
    private accountService: AccountService,
    private eventEmitter: EventEmitter2,
  ) {}

  // Initializes the exchange with the first account found.
  async onModuleInit() {
    try {
      const account = await this.getFirstAccount();
      this.initializeExchange(account);
    } catch (error) {
      this.logger.error('Error during module initialization', error.stack);
    }
  }

  // Fetches the first account from the account service.
  private async getFirstAccount() {
    const accounts = await this.accountService.findAll();
    if (accounts.length === 0) {
      this.logger.warn('No account found. Please create an account first.');
      throw new Error('No account found');
    }
    return accounts[0];
  }

  // Initializes the exchange and websocket with a given account.
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

  // Initializes the websocket with a given api key and secret.
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

  // Handles websocket updates by emitting ticker update events.
  private handleWsUpdate(msg: any) {
    if (msg.topic && msg.topic.startsWith('tickers.')) {
      this.eventEmitter.emit(
        Events.TICKER_UPDATE,
        new TickerUpdateEvent(msg.topic, msg.data),
      );
    }
  }

  // Subscribes to a ticker of a given symbol.
  subscribeTicker(symbol: string): void {
    this.performWsAction(
      'subscribe',
      `tickers.${symbol}`,
      'subscribing to ticker',
    );
  }

  // Unsubscribes from a ticker of a given symbol.
  unsubscribeTicker(symbol: string): void {
    this.performWsAction(
      'unsubscribe',
      `tickers.${symbol}`,
      'unsubscribing from ticker',
    );
  }

  // Performs a websocket action with error handling.
  private performWsAction(
    action: string,
    topic: string,
    actionDescription: string,
  ) {
    try {
      this.ws[action](topic);
      this.logger.log(
        `${
          actionDescription.charAt(0).toUpperCase() + actionDescription.slice(1)
        } ${topic}`,
      );
    } catch (error) {
      this.logger.error(`Error ${actionDescription}`, error.stack);
    }
  }

  // Fetches balances from the exchange.
  private async getBalances(): Promise<Balances> {
    this.ensureExchangeInitialized();
    try {
      return await this.exchange.fetchBalance();
    } catch (error) {
      this.logger.error('Error fetching balances', error.stack);
    }
  }

  // Fetches USDT balance from the exchange.
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

  // Fetches open positions from the exchange.
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

  // Opens a long order on the exchange.
  async openLongOrder(symbol: string, size: number): Promise<Order> {
    return this.createOrder(
      symbol,
      size,
      'createMarketBuyOrder',
      'opening long order',
    );
  }

  // Opens a short order on the exchange.
  async openShortOrder(symbol: string, size: number): Promise<Order> {
    return this.createOrder(
      symbol,
      size,
      'createMarketSellOrder',
      'opening short order',
    );
  }

  // Creates an order with error handling.
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

  // Updates a stop loss on the exchange.
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

  // Updates a take profit on the exchange.
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

  // Edits an order with error handling.
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

  // Closes an order on the exchange.
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

  // Checks if the exchange is initialized and throws an error if not.
  private ensureExchangeInitialized() {
    if (!this.exchange) {
      this.logger.error(
        'Exchange not initialized. Please create an account first.',
      );
      throw new Error('Exchange not initialized');
    }
  }
}
