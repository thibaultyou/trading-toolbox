import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebsocketClient, WSClientConfigurableOptions } from 'bybit-api';

import { TrackingFailedException } from '../../../common/exceptions/tracking.exceptions';
import { IAccountTracker } from '../../../common/types/account-tracker.interface';
import { Events } from '../../../config';
import { AccountService } from '../../account/account.service';
import { ExecutionDataReceivedEvent } from '../events/execution-data-received.event';
import { OrderDataUpdatedEvent } from '../events/order-data-updated.event';
import { PositionDataUpdatedEvent } from '../events/position-data-updated.event';
import { TickerDataUpdatedEvent } from '../events/ticker-data-updated.event';
import { WalletDataUpdatedEvent } from '../events/wallet-data-updated.event';

@Injectable()
export class WebsocketManagerService implements IAccountTracker {
  private logger = new Logger(WebsocketManagerService.name);
  private wsConnections: Map<string, WebsocketClient> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private accountService: AccountService
  ) {}

  async startTrackingAccount(accountId: string) {
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (this.wsConnections.has(accountId)) {
      this.logger.warn(`Account tracking skipped - AccountID: ${accountId} - Reason: Already tracked`);
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
      this.logger.log(`Started tracking account - AccountID: ${accountId}`);
    } catch (error) {
      this.logger.error(`Account tracking failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw new TrackingFailedException(accountId, error);
    }
  }

  stopTrackingAccount(accountId: string) {
    this.logger.debug(`Stopping account tracking - AccountID: ${accountId}`);

    if (this.wsConnections.has(accountId)) {
      this.cleanResources(accountId);
      this.logger.log(`Stopped tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking removal failed - AccountID: ${accountId} - Reason: Not tracked`);
    }
  }

  async subscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic: boolean = false) {
    this.logger.debug(
      `Initiating websocket subscription - AccountID: ${accountId} - Topics: ${Array.isArray(wsTopics) ? wsTopics.join(', ') : wsTopics}`
    );
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
    const subscriptions = this.subscriptions.get(accountId);
    const topicsToSubscribe = topics.filter((topic) => !subscriptions?.has(topic));

    if (topicsToSubscribe.length > 0) {
      try {
        await ws.subscribeV5(topicsToSubscribe, 'linear', isPrivateTopic);
        topicsToSubscribe.forEach((topic) => {
          subscriptions.add(topic);
        });
        this.subscriptions.set(accountId, subscriptions);
        this.logger.log(
          `Subscribed to websocket topics - AccountID: ${accountId} - Topics: ${topicsToSubscribe.sort().join(', ')}`
        );
      } catch (error) {
        this.logger.error(
          `Websocket subscription failed - AccountID: ${accountId} - Error: ${error.message}`,
          error.stack
        );
      }
    }
  }

  unsubscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic: boolean = false) {
    this.logger.debug(
      `Initiating websocket unsubscription - AccountID: ${accountId} - Topics: ${Array.isArray(wsTopics) ? wsTopics.join(', ') : wsTopics}`
    );
    const ws = this.wsConnections.get(accountId);

    if (!ws) {
      this.logger.warn(
        `Websocket unsubscription failed - AccountID: ${accountId} - Reason: WebSocket client not found`
      );
      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subscriptions = this.subscriptions.get(accountId);
    const failedTopics = [];
    topics.forEach((topic) => {
      if (subscriptions?.has(topic)) {
        try {
          ws.unsubscribeV5([topic], 'linear', isPrivateTopic);
          subscriptions.delete(topic);
        } catch (error) {
          this.logger.error(
            `Websocket unsubscription failed - AccountID: ${accountId} - Topic: ${topic} - Error: ${error.message}`,
            error.stack
          );
          failedTopics.push(topic);
        }
      }
    });

    if (failedTopics.length === topics.length) {
      this.logger.error(
        `All websocket unsubscriptions failed - AccountID: ${accountId} - Topics: ${topics.join(', ')}`
      );
    } else {
      this.logger.log(
        `Unsubscribed from websocket topics - AccountID: ${accountId} - Topics: ${topics.filter((topic) => !failedTopics.includes(topic)).join(', ')}`
      );
    }
  }

  private handleWsUpdate(accountId: string, message: any) {
    this.logger.debug(`Handling websocket update - AccountID: ${accountId} - Topic: ${message?.topic}`);

    if (message?.topic) {
      const topicHandlerMapping = {
        'tickers.': this.handleTickerUpdate.bind(this),
        execution: this.handleExecutionUpdate.bind(this),
        position: this.handlePositionUpdate.bind(this),
        order: this.handleOrderUpdate.bind(this),
        wallet: this.handleWalletUpdate.bind(this)
      };
      for (const [key, handler] of Object.entries(topicHandlerMapping)) {
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
    this.eventEmitter.emit(Events.EXECUTION_DATA_RECEIVED, new ExecutionDataReceivedEvent(accountId, message.data));
  }

  private handlePositionUpdate(accountId: string, message: any) {
    this.logger.debug(`Handling position update - AccountID: ${accountId}`);
    this.eventEmitter.emit(Events.POSITION_DATA_UPDATED, new PositionDataUpdatedEvent(accountId, message.data));
  }

  private handleTickerUpdate(accountId: string, message: any) {
    const marketId = message.topic.substring('tickers.'.length);
    this.logger.debug(`Handling ticker update - AccountID: ${accountId} - MarketID: ${marketId}`);
    this.eventEmitter.emit(Events.TICKER_DATA_UPDATED, new TickerDataUpdatedEvent(accountId, marketId, message.data));
  }

  private handleOrderUpdate(accountId: string, message: any) {
    this.logger.debug(`Handling order update - AccountID: ${accountId}`);
    this.eventEmitter.emit(Events.ORDER_DATA_UPDATED, new OrderDataUpdatedEvent(accountId, message.data));
  }

  private handleWalletUpdate(accountId: string, message: any) {
    this.logger.debug(`Handling wallet update - AccountID: ${accountId}`);
    this.eventEmitter.emit(Events.WALLET_DATA_UPDATED, new WalletDataUpdatedEvent(accountId, message.data));
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
