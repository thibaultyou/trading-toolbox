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

  async startTrackingAccount(accountId: string): Promise<void> {
    if (this.wsConnections.has(accountId)) {
      this.logger.warn(`Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);
      return;
    }

    try {
      const account = await this.accountService.getAccountById(accountId);
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
      this.logger.log(`Tracking Initiated - AccountID: ${accountId}`);
    } catch (error) {
      this.logger.error(`Tracking Failed - AccountID: ${accountId}, Error: ${error.message}`);
      throw new TrackingFailedException(accountId, error);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.wsConnections.has(accountId)) {
      this.cleanResources(accountId);
      this.logger.log(`Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  async subscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic: boolean = false): Promise<void> {
    this.logger.log(
      `Websocket - Subscription Initiated - AccountID: ${accountId}, Topics: ${Array.isArray(wsTopics) ? wsTopics.join(', ') : wsTopics}`
    );
    let ws = this.wsConnections.get(accountId);

    if (!ws) {
      await this.startTrackingAccount(accountId);
      ws = this.wsConnections.get(accountId);
    }

    if (!ws) {
      this.logger.error(
        `Websocket - Subscription Failed - AccountID: ${accountId}, Reason: WebSocket Client Not Found`
      );
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
          `Websocket - Subscribed - AccountID: ${accountId}, Topics: ${topicsToSubscribe.sort().join(', ')}`
        );
      } catch (error) {
        this.logger.error(`Websocket - Subscription Failed - AccountID: ${accountId}, Error: ${error}`);
      }
    }
  }

  unsubscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic: boolean = false) {
    const ws = this.wsConnections.get(accountId);

    if (!ws) {
      this.logger.error(
        `Websocket - Unsubscription Failed - AccountID: ${accountId}, Reason: WebSocket Client Not Found`
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
            `Websocket - Unsubscription Failed - AccountID: ${accountId}, Topic: ${topic}, Error: ${error.message}`
          );
          failedTopics.push(topic);
        }
      }
    });

    if (failedTopics.length === topics.length) {
      this.logger.error(
        `Websocket - All Unsubscriptions Failed - AccountID: ${accountId}, Topics: ${topics.join(', ')}`
      );
    } else {
      this.logger.log(
        `Websocket - Unsubscribed - AccountID: ${accountId}, Topics: ${topics.filter((topic) => !failedTopics.includes(topic)).join(', ')}`
      );
    }
  }

  private handleWsUpdate(accountId: string, message: any) {
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
      this.logger.warn(`Websocket - Unrecognized Topic - AccountID: ${accountId}, Topic: ${message.topic}`);
    }
  }

  private handleExecutionUpdate(accountId: string, message: any) {
    this.eventEmitter.emit(Events.EXECUTION_DATA_RECEIVED, new ExecutionDataReceivedEvent(accountId, message.data));
  }

  private handlePositionUpdate(accountId: string, message: any) {
    this.eventEmitter.emit(Events.POSITION_DATA_UPDATED, new PositionDataUpdatedEvent(accountId, message.data));
  }

  private handleTickerUpdate(accountId: string, message: any) {
    const marketId = message.topic.substring('tickers.'.length);
    this.eventEmitter.emit(Events.TICKER_DATA_UPDATED, new TickerDataUpdatedEvent(accountId, marketId, message.data));
  }

  private handleOrderUpdate(accountId: string, message: any) {
    this.eventEmitter.emit(Events.ORDER_DATA_UPDATED, new OrderDataUpdatedEvent(accountId, message.data));
  }

  private handleWalletUpdate(accountId: string, message: any) {
    this.eventEmitter.emit(Events.WALLET_DATA_UPDATED, new WalletDataUpdatedEvent(accountId, message.data));
  }

  private cleanResources(accountId: string) {
    try {
      const ws = this.wsConnections.get(accountId);

      if (ws) {
        ws.closeAll();
        this.wsConnections.delete(accountId);
        this.subscriptions.delete(accountId);
        this.logger.log(`Websocket - Cleaned Resources - AccountID: ${accountId}`);
      }
    } catch (error) {
      this.logger.error(`Websocket - Resources Cleaning Failed - AccountID: ${accountId}, Error: ${error.message}`);
    }
  }
}
