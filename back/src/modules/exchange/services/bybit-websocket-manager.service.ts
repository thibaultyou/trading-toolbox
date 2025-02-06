import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebsocketClient, WSClientConfigurableOptions } from 'bybit-api';

import { AccountService } from '@account/account.service';
import { TrackingFailedException } from '@common/exceptions/tracking.exceptions';
import { Events } from '@config';

import { ExecutionDataReceivedEvent } from '../events/execution-data-received.event';
import { OrderDataUpdatedEvent } from '../events/order-data-updated.event';
import { PositionDataUpdatedEvent } from '../events/position-data-updated.event';
import { TickerDataUpdatedEvent } from '../events/ticker-data-updated.event';
import { WalletDataUpdatedEvent } from '../events/wallet-data-updated.event';
import { IExchangeWebsocketService } from '../types/exchange-websocket-service.interface';

@Injectable()
export class BybitWebsocketManagerService implements IExchangeWebsocketService {
  private logger = new Logger(BybitWebsocketManagerService.name);
  private wsConnections: Map<string, WebsocketClient> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly accountService: AccountService
  ) {}

  async startTrackingAccount(accountId: string) {
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (this.wsConnections.has(accountId)) {
      this.logger.warn(`Already tracking - AccountID: ${accountId}`);
      return;
    }

    try {
      const account = await this.accountService.getAccountByIdForSystem(accountId);
      const options: WSClientConfigurableOptions = {
        key: account.key,
        secret: account.secret,
        market: 'v5'
      };

      const ws = new WebsocketClient(options);
      ws.on('update', (message: any) => this.handleWsUpdate(accountId, message));
      this.wsConnections.set(accountId, ws);
      this.subscriptions.set(accountId, new Set());

      await this.subscribe(accountId, ['execution', 'position', 'order', 'wallet'], true);

      this.logger.log(`Tracking started - AccountID: ${accountId}`);
    } catch (error) {
      this.logger.error(`Tracking failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw new TrackingFailedException(accountId, error);
    }
  }

  stopTrackingAccount(accountId: string) {
    this.logger.debug(`Stopping account tracking - AccountID: ${accountId}`);
    if (this.wsConnections.has(accountId)) {
      this.cleanResources(accountId);
      this.logger.log(`Tracking stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Not tracked - AccountID: ${accountId}`);
    }
  }

  async subscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic = false) {
    this.logger.debug(`Subscribing - AccountID: ${accountId} - Topics: ${wsTopics}`);
    let ws = this.wsConnections.get(accountId);

    if (!ws) {
      await this.startTrackingAccount(accountId);
      ws = this.wsConnections.get(accountId);
    }
    if (!ws) {
      this.logger.warn(`Websocket subscription failed - AccountID: ${accountId} - Reason: WebSocket client not found`);
      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subscriptions = this.subscriptions.get(accountId) || new Set<string>();
    const newTopics = topics.filter((topic) => !subscriptions.has(topic));

    if (!newTopics.length) {
      this.logger.debug(`Already subscribed to topics - AccountID: ${accountId} - Topics: ${wsTopics}`);
      return;
    }

    try {
      await ws.subscribeV5(newTopics, 'linear', isPrivateTopic);
      newTopics.forEach((t) => subscriptions.add(t));
      this.subscriptions.set(accountId, subscriptions);
      this.logger.log(`Subscribed - AccountID: ${accountId}, Topics: [${newTopics.join(', ')}]`);
    } catch (error) {
      this.logger.error(`Subscription failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
    }
  }

  unsubscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic = false) {
    this.logger.debug(`Unsubscribe - AccountID: ${accountId} - Topics: ${wsTopics}`);
    const ws = this.wsConnections.get(accountId);
    if (!ws) {
      this.logger.warn(`No WS client found - AccountID: ${accountId}`);
      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subscriptions = this.subscriptions.get(accountId) || new Set<string>();
    const unsubFailures: string[] = [];

    topics.forEach((topic) => {
      if (subscriptions.has(topic)) {
        try {
          ws.unsubscribeV5([topic], 'linear', isPrivateTopic);
          subscriptions.delete(topic);
        } catch (err) {
          this.logger.error(
            `Unsubscribe failed - AccountID: ${accountId} - Topic: ${topic} - Error: ${err.message}`,
            err.stack
          );
          unsubFailures.push(topic);
        }
      }
    });
    this.logger.log(
      `Unsubscribed - AccountID: ${accountId}, Successful: [${topics.filter(
        (t) => !unsubFailures.includes(t)
      )}], Failed: [${unsubFailures}]`
    );
  }

  private handleWsUpdate(accountId: string, message: any) {
    this.logger.debug(`Handling websocket update - AccountID: ${accountId} - Topic: ${message?.topic}`);

    if (message?.topic) {
      const mapping = {
        'tickers.': this.handleTickerUpdate.bind(this),
        execution: this.handleExecutionUpdate.bind(this),
        position: this.handlePositionUpdate.bind(this),
        order: this.handleOrderUpdate.bind(this),
        wallet: this.handleWalletUpdate.bind(this)
      };

      for (const [key, handler] of Object.entries(mapping)) {
        if (message.topic === key || message.topic.startsWith(key)) {
          handler(accountId, message);
          return;
        }
      }
      this.logger.warn(`Unrecognized websocket topic - AccountID: ${accountId} - Topic: ${message.topic}`);
    }
  }

  private handleExecutionUpdate(accountId: string, message: any) {
    this.logger.debug(`Handling execution update - AccountID: ${accountId}`);
    this.eventEmitter.emit(Events.Data.EXECUTION_RECEIVED, new ExecutionDataReceivedEvent(accountId, message.data));
  }

  private handlePositionUpdate(accountId: string, message: any) {
    this.logger.debug(`Handling position update - AccountID: ${accountId}`);
    this.eventEmitter.emit(Events.Data.POSITION_UPDATED, new PositionDataUpdatedEvent(accountId, message.data));
  }

  private handleTickerUpdate(accountId: string, message: any) {
    const marketId = message.topic.substring('tickers.'.length);
    this.logger.debug(`Handling ticker update - AccountID: ${accountId} - MarketID: ${marketId}`);
    this.eventEmitter.emit(Events.Data.TICKER_UPDATED, new TickerDataUpdatedEvent(accountId, marketId, message.data));
  }

  private handleOrderUpdate(accountId: string, message: any) {
    this.logger.debug(`Handling order update - AccountID: ${accountId}`);
    this.eventEmitter.emit(Events.Data.ORDER_UPDATED, new OrderDataUpdatedEvent(accountId, message.data));
  }

  private handleWalletUpdate(accountId: string, message: any) {
    this.logger.debug(`Handling wallet update - AccountID: ${accountId}`);
    this.eventEmitter.emit(Events.Data.WALLET_UPDATED, new WalletDataUpdatedEvent(accountId, message.data));
  }

  private cleanResources(accountId: string) {
    this.logger.debug(`Cleaning websocket resources - AccountID: ${accountId}`);

    try {
      const ws = this.wsConnections.get(accountId);
      if (ws) {
        ws.closeAll();
        this.wsConnections.delete(accountId);
        this.subscriptions.delete(accountId);
        this.logger.log(`Cleaned websocket resources - AccountID: ${accountId}`);
      }
    } catch (error) {
      this.logger.error(
        `Websocket resources cleaning failed - AccountID: ${accountId} - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
