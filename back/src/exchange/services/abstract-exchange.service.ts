import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebsocketClient, WSClientConfigurableOptions } from 'bybit-api';
import { Balances, Exchange, Order } from 'ccxt';

import { AccountService } from '../../account/account.service';
import { Account } from '../../account/entities/account.entity';
import { Events } from '../../app.constants';
import { TickerUpdateEvent } from '../../ticker/events/ticker-update.event';
import {
  ExchangeOperationFailedException,
  ExchangeNotInitializedException,
  FetchPositionsNotSupportedException,
} from '../exceptions/exchange.exceptions';
import { IExchangeService } from '../exchange.interfaces';

export abstract class AbstractExchangeService implements IExchangeService {
  protected exchange: Exchange;
  protected ws: WebsocketClient;
  protected subscribedTickers = new Set<string>();
  protected logger = new Logger(AbstractExchangeService.name);
  protected account: Account;

  constructor(
    protected accountService: AccountService,
    protected eventEmitter: EventEmitter2,
    account: Account,
  ) {
    this.account = account;
  }

  abstract initialize(): void;

  initWs(options: WSClientConfigurableOptions): WebsocketClient {
    const ws = new WebsocketClient(options);
    ws.on('update', this.handleWsUpdate.bind(this));
    return ws;
  }

  private handleWsUpdate(msg: any) {
    if (msg.topic && msg.topic.startsWith('tickers.')) {
      this.eventEmitter.emit(
        Events.TICKER_UPDATE,
        new TickerUpdateEvent(this.account.name, msg.topic, msg.data),
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
        `${
          actionDescription.charAt(0).toUpperCase() + actionDescription.slice(1)
        } ${topic}`,
      );
    } catch (error) {
      throw new ExchangeOperationFailedException(
        actionDescription,
        error.message,
      );
    }
  }

  private async getBalances(): Promise<Balances> {
    this.ensureExchangeInitialized();
    try {
      return await this.exchange.fetchBalance();
    } catch (error) {
      throw new ExchangeOperationFailedException(
        'fetching balances',
        error.message,
      );
    }
  }

  async getBalance(): Promise<number> {
    const balances = await this.getBalances();
    return Number(
      balances?.info?.result?.list?.find((asset) => asset?.coin == 'USDT')
        ?.equity,
    );
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
      throw new ExchangeOperationFailedException(
        'fetching tickers',
        error.message,
      );
    }
  }

  async getOpenPositions(): Promise<any> {
    this.ensureExchangeInitialized();
    if (this.exchange?.has?.fetchPositions) {
      try {
        return await this.exchange.fetchPositions();
      } catch (error) {
        throw new ExchangeOperationFailedException(
          'fetching open positions',
          error.message,
        );
      }
    } else {
      throw new FetchPositionsNotSupportedException();
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
      throw new ExchangeOperationFailedException(
        actionDescription,
        error.message,
      );
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
      throw new ExchangeOperationFailedException(
        actionDescription,
        error.message,
      );
    }
  }

  async closeOrder(orderId: string, symbol: string): Promise<Order> {
    this.ensureExchangeInitialized();
    try {
      return await this.exchange.cancelOrder(orderId, symbol);
    } catch (error) {
      throw new ExchangeOperationFailedException(
        'closing order',
        error.message,
      );
    }
  }

  async fetchOpenOrders(): Promise<Order[]> {
    this.ensureExchangeInitialized();
    try {
      return await this.exchange.fetchOpenOrders();
    } catch (error) {
      throw new ExchangeOperationFailedException(
        'fetching open orders',
        error.message,
      );
    }
  }

  private ensureExchangeInitialized() {
    if (!this.exchange) {
      throw new ExchangeNotInitializedException();
    }
  }

  cleanResources() {
    this.exchange = null;
    if (this.ws) {
      this.ws.closeAll();
      this.ws = null;
    }
    this.subscribedTickers.clear();
  }
}
