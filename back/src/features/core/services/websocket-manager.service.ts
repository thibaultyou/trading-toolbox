import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebsocketClient, WSClientConfigurableOptions } from 'bybit-api';

import { IAccountTracker } from '../../../common/interfaces/account-tracker.interface';
import { Events } from '../../../config';
import { AccountService } from '../../account/account.service';
import { Account } from '../../account/entities/account.entity';
import { TickerUpdatedEvent } from '../../ticker/events/ticker-updated.event';

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
      this.logger.warn(`WebSocket - Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);

      return;
    }

    let account: Account;

    try {
      account = await this.accountService.getAccountById(accountId);
    } catch (error) {
      this.logger.error(`WebSocket - Account Fetch Failed - AccountID: ${accountId}, Error: ${error.message}`);
      // TODO custom exception
      throw new Error(`TODO`);
    }

    const options: WSClientConfigurableOptions = {
      key: account.key,
      secret: account.secret,
      testnet: false,
      market: 'contractUSDT'
    };

    try {
      const ws = new WebsocketClient(options);

      ws.on('update', (message: any) => this.handleWsUpdate(accountId, message));
      this.wsConnections.set(accountId, ws);
      this.subscriptions.set(accountId, new Set());
      this.logger.log(`WebSocket - Tracking Initiated - AccountID: ${accountId}`);
    } catch (error) {
      this.logger.error(`WebSocket - Tracking Failed - AccountID: ${accountId}, Error: ${error.message}`);
      // TODO custom exception
      throw new Error(`TODO`);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.wsConnections.has(accountId)) {
      this.cleanResources(accountId);
      this.logger.log(`WebSocket - Tracking Stopped and Resources Cleaned - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`WebSocket - Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  async subscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic: boolean = false) {
    this.logger.log(
      `WebSocket - Subscription Initiated - AccountID: ${accountId}, Topics: ${Array.isArray(wsTopics) ? wsTopics.join(', ') : wsTopics}`
    );
    let ws = this.wsConnections.get(accountId);

    if (!ws) {
      await this.startTrackingAccount(accountId);
      ws = this.wsConnections.get(accountId);
    }

    if (!ws) {
      this.logger.error(
        `WebSocket - Subscription Failed - AccountID: ${accountId}, Reason: WebSocket Client Not Found`
      );

      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subscriptions = this.subscriptions.get(accountId);
    const topicsToSubscribe = topics.filter((topic) => !subscriptions?.has(topic));

    if (topicsToSubscribe.length > 0) {
      try {
        await ws.subscribe(topicsToSubscribe, isPrivateTopic);
        topicsToSubscribe.forEach((topic) => {
          subscriptions.add(topic);
        });
        this.subscriptions.set(accountId, subscriptions);
        this.logger.log(
          `WebSocket - Subscribed - AccountID: ${accountId}, Topics: ${topicsToSubscribe.sort().join(', ')}`
        );
      } catch (error) {
        this.logger.error(`WebSocket - Subscription Failed - AccountID: ${accountId}, Error: ${error}`);
      }
    }
  }

  unsubscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic: boolean = false) {
    const ws = this.wsConnections.get(accountId);

    if (!ws) {
      this.logger.error(
        `WebSocket - Unsubscription Failed - AccountID: ${accountId}, Reason: WebSocket Client Not Found`
      );

      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subscriptions = this.subscriptions.get(accountId);

    topics.forEach((topic) => {
      if (subscriptions?.has(topic)) {
        try {
          ws.unsubscribe([topic], isPrivateTopic);
          subscriptions.delete(topic);
        } catch (error) {
          this.logger.error(
            `WebSocket - Unsubscription Failed - AccountID: ${accountId}, Topic: ${topic}, Error: ${error.message}`
          );
        }
      }
    });
    this.logger.log(`WebSocket - Unsubscribed - AccountID: ${accountId}, Topics: ${topics.join(', ')}`);
  }

  private handleWsUpdate(accountId: string, message: any) {
    if (message?.topic) {
      const topicHandlerMapping = {
        'tickers.': this.handleTickerUpdate.bind(this)
        // FIXME update this
        // execution: this.handleExecutionUpdate,
        // position: this.handlePositionUpdate,
        // order: this.handleOrderUpdate,
        // wallet: this.handleWalletUpdate,
      };

      for (const [key, handler] of Object.entries(topicHandlerMapping)) {
        if (message.topic.startsWith(key)) {
          handler(accountId, message);

          return;
        }
      }
      this.logger.warn(`WebSocket - Unrecognized Topic - AccountID: ${accountId}, Topic: ${message.topic}`);
      // FIXME update this
      // this.logger.warn(message.data)
      // this.eventEmitter.emit(`${message.topic}.${accountId}`, message.data);
      // this.logger.log(`Message dispatched for topic ${message.topic} and account ${accountId}`);
    }
  }

  private handleTickerUpdate(accountId: string, msg: any) {
    const marketId = msg.topic.substring('tickers.'.length);
    const { bid1Price, ask1Price } = msg.data;

    if (bid1Price && ask1Price) {
      const calculatedPrice = (parseFloat(bid1Price) + parseFloat(ask1Price)) / 2;

      this.eventEmitter.emit(Events.TICKER_UPDATED, new TickerUpdatedEvent(accountId, marketId, calculatedPrice));
      this.logger.debug(
        `WebSocket - Ticker Update - AccountID: ${accountId}, MarketID: ${marketId}, Price: ${calculatedPrice.toFixed(2)}`
      );
    } else {
      this.logger.debug(
        `WebSocket - Ticker Update Skipped - AccountID: ${accountId}, MarketID: ${marketId}, Reason: Null Values`
      );
    }
  }

  private cleanResources(accountId: string) {
    const ws = this.wsConnections.get(accountId);

    if (ws) {
      ws.closeAll();
      this.wsConnections.delete(accountId);
      this.subscriptions.delete(accountId);
      this.logger.log(`Cleaned up resources for account ${accountId}`);
    }
  }
}

//   const topics = ['execution']; // 'wallet', 'position', 'order'

// private handleExecutionUpdate(msg: any) {
//   this.eventEmitter.emit(
//     Events.ORDER_EXECUTED,
//     new OrderExecutedEvent(this.account.id, msg.data),
//   );
// }

// private handlePositionUpdate(msg: any) {
//   this.logger.log('position', JSON.stringify(msg));
//   // FIXME add event update
// }

// private handleOrderUpdate(msg: any) {
//   this.logger.log('order', JSON.stringify(msg));
//   // FIXME add event update
// }

// private handleWalletUpdate(msg: any) {
//   this.eventEmitter.emit(
//     Events.UPDATE_BALANCE,
//     new UpdateBalanceEvent(this.account.id, msg.data),
//   );
// }
