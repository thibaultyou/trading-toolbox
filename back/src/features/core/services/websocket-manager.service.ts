import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebsocketClient, WSClientConfigurableOptions } from 'bybit-api';

import { IAccountTracker } from '../../../common/types/account-tracker.interface';
import { Events } from '../../../config';
import { AccountService } from '../../account/account.service';
import { Account } from '../../account/entities/account.entity';
import { AccountNotFoundException } from '../../account/exceptions/account.exceptions';
import { ExecutionDataReceivedEvent } from '../events/execution-data-received.event';
import { TickerDataUpdatedEvent } from '../events/ticker-data-updated.event';
import { WalletDataUpdatedEvent } from '../events/wallet-data-updated.event';
import { TrackingFailedException } from '../exceptions/websocket.exceptions';

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

    let account: Account;

    try {
      account = await this.accountService.getAccountById(accountId);
    } catch (error) {
      this.logger.error(`Account Fetch Failed - AccountID: ${accountId}, Error: ${error.message}`);
      throw new AccountNotFoundException(accountId);
    }

    const options: WSClientConfigurableOptions = {
      key: account.key,
      secret: account.secret,
      market: 'v5'
    };

    try {
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
      this.logger.log(`Tracking Stopped and Resources Cleaned - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  async subscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic: boolean = false) {
    this.logger.log(
      `Subscription Initiated - AccountID: ${accountId}, Topics: ${Array.isArray(wsTopics) ? wsTopics.join(', ') : wsTopics}`
    );
    let ws = this.wsConnections.get(accountId);

    if (!ws) {
      await this.startTrackingAccount(accountId);
      ws = this.wsConnections.get(accountId);
    }

    if (!ws) {
      this.logger.error(`Subscription Failed - AccountID: ${accountId}, Reason: WebSocket Client Not Found`);
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
        this.logger.log(`Subscribed - AccountID: ${accountId}, Topics: ${topicsToSubscribe.sort().join(', ')}`);
      } catch (error) {
        this.logger.error(`Subscription Failed - AccountID: ${accountId}, Error: ${error}`);
      }
    }
  }

  unsubscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic: boolean = false) {
    const ws = this.wsConnections.get(accountId);

    if (!ws) {
      this.logger.error(`Unsubscription Failed - AccountID: ${accountId}, Reason: WebSocket Client Not Found`);
      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subscriptions = this.subscriptions.get(accountId);
    topics.forEach((topic) => {
      if (subscriptions?.has(topic)) {
        try {
          ws.unsubscribeV5([topic], 'linear', isPrivateTopic);
          subscriptions.delete(topic);
        } catch (error) {
          this.logger.error(
            `Unsubscription Failed - AccountID: ${accountId}, Topic: ${topic}, Error: ${error.message}`
          );
        }
      }
    });
    this.logger.log(`Unsubscribed - AccountID: ${accountId}, Topics: ${topics.join(', ')}`);
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
      this.logger.warn(`Unrecognized Topic - AccountID: ${accountId}, Topic: ${message.topic}`);
    }
  }

  private handleTickerUpdate(accountId: string, msg: any) {
    const marketId = msg.topic.substring('tickers.'.length);
    this.eventEmitter.emit(Events.TICKER_DATA_UPDATED, new TickerDataUpdatedEvent(accountId, marketId, msg.data));
  }

  private handlePositionUpdate(accountId: string, msg: any) {
    // this.logger.log('position', JSON.stringify(msg));
    // Implement event update logic here
  }

  private handleExecutionUpdate(accountId: string, msg: any) {
    this.eventEmitter.emit(Events.EXECUTION_DATA_RECEIVED, new ExecutionDataReceivedEvent(accountId, msg.data));
  }

  private handleOrderUpdate(accountId: string, msg: any) {
    // this.logger.log('order', JSON.stringify(msg));
    // Implement event update logic here
  }

  private handleWalletUpdate(accountId: string, msg: any) {
    this.eventEmitter.emit(Events.WALLET_DATA_UPDATED, new WalletDataUpdatedEvent(accountId, msg.data));
  }

  private cleanResources(accountId: string) {
    try {
      const ws = this.wsConnections.get(accountId);

      if (ws) {
        ws.closeAll();
        this.wsConnections.delete(accountId);
        this.subscriptions.delete(accountId);
        this.logger.log(`Cleaned up resources for account ${accountId}`);
      }
    } catch (error) {
      this.logger.error(`Error cleaning resources for AccountID: ${accountId}, Error: ${error.message}`);
    }
  }
}
