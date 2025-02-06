import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { TrackingFailedException } from '@common/exceptions/tracking.exceptions';
import { AccountService } from '@account/account.service';
import { Events } from '@config';

import { ExecutionDataReceivedEvent } from '../../events/execution-data-received.event';
import { OrderDataUpdatedEvent } from '../../events/order-data-updated.event';
import { PositionDataUpdatedEvent } from '../../events/position-data-updated.event';
import { TickerDataUpdatedEvent } from '../../events/ticker-data-updated.event';
import { WalletDataUpdatedEvent } from '../../events/wallet-data-updated.event';

import { IExchangeWebsocketService } from '../../types/exchange-websocket-service.interface';

import { WebsocketClientV2, DefaultLogger, WsTopicV2 } from 'bitget-api';
import { IAccountTracker } from '@common/interfaces/account-tracker.interface';

function mapUnifiedTopicToBitget(topic: string): WsTopicV2 {
  switch (topic) {
    case 'execution':
    case 'order':
      return 'orders'; // both become 'orders' channel
    case 'position':
      return 'positions';
    case 'order':
      return 'orders';
    case 'wallet':
      return 'account';
    case 'ticker':
      return 'ticker';
    default:
      throw new Error(`Unrecognized topic for Bitget: ${topic}`);
  }
}

@Injectable()
export class BitgetWebsocketManagerService implements IExchangeWebsocketService {
  private logger = new Logger(BitgetWebsocketManagerService.name);
  private wsConnections: Map<string, WebsocketClientV2> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly accountService: AccountService
  ) {}

  async startTrackingAccount(accountId: string): Promise<void> {
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (this.wsConnections.has(accountId)) {
      this.logger.warn(`Already tracking - AccountID: ${accountId}`);
      return;
    }

    try {
      const account = await this.accountService.getAccountByIdForSystem(accountId);

      const ws = new WebsocketClientV2(
        {
          apiKey: account.key,
          apiSecret: account.secret,
          apiPass: account.passphrase
        },
        DefaultLogger
      );

      ws.on('update', (message) => this.handleWsUpdate(accountId, message));
      // ws.on('open', (data) => this.logger.log(`WebSocket open - AccountID: ${accountId} - Key: ${data.wsKey}`));
      // ws.on('response', (resp) =>
      //   this.logger.debug(`WS response - AccountID: ${accountId} - Response: ${JSON.stringify(resp)}`)
      // );
      // ws.on('reconnect', ({ wsKey }) => this.logger.warn(`WS reconnecting - AccountID: ${accountId} - Key: ${wsKey}`));
      // ws.on('reconnected', ({ wsKey }) => this.logger.log(`WS reconnected - AccountID: ${accountId} - Key: ${wsKey}`));
      // ws.on('exception', (err) =>
      //   this.logger.error(`WS exception - AccountID: ${accountId} - Error: ${err}`, err.stack)
      // );
      // ws.on('authenticated', (evt) =>
      //   this.logger.log(`WS authenticated - AccountID: ${accountId} - Key: ${evt.wsKey}`)
      // );

      this.wsConnections.set(accountId, ws);
      this.subscriptions.set(accountId, new Set());

      await this.subscribe(accountId, ['execution', 'position', 'wallet'], true);

      this.logger.log(`Tracking started - AccountID: ${accountId}`);
    } catch (error) {
      this.logger.error(`Tracking failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw new TrackingFailedException(accountId, error);
    }
  }

  stopTrackingAccount(accountId: string): void {
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
      this.logger.warn(`Cannot subscribe, no WebSocket client - AccountID: ${accountId}`);
      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subs = this.subscriptions.get(accountId) ?? new Set<string>();

    const newTopics = topics.filter((t) => !subs.has(t));
    if (!newTopics.length) {
      this.logger.debug(`Already subscribed - AccountID: ${accountId} - Topics: ${JSON.stringify(topics)}`);
      return;
    }

    try {
      for (const unifiedTopic of newTopics) {
        // Special case: if the topic is like "tickers.DOGEUSDT", parse out the symbol
        if (unifiedTopic.startsWith('tickers.')) {
          const symbol = unifiedTopic.split('.')[1]; // e.g. "DOGEUSDT"
          ws.subscribeTopic('USDT-FUTURES', 'ticker', symbol);
        } else {
          const bitgetTopic: WsTopicV2 = mapUnifiedTopicToBitget(unifiedTopic);
          ws.subscribeTopic('USDT-FUTURES', bitgetTopic, 'default');
        }
        subs.add(unifiedTopic);
      }

      this.subscriptions.set(accountId, subs);
      this.logger.log(`Subscribed - AccountID: ${accountId}, Topics: [${newTopics.join(', ')}]`);
    } catch (error) {
      this.logger.error(`Subscription failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
    }
  }

  unsubscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic = false) {
    this.logger.debug(`Unsubscribing - AccountID: ${accountId}, Topics: ${wsTopics}`);
    const ws = this.wsConnections.get(accountId);
    if (!ws) {
      this.logger.warn(`No WS client found - AccountID: ${accountId}`);
      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subs = this.subscriptions.get(accountId) ?? new Set<string>();
    const unsubFailures: string[] = [];

    for (const unifiedTopic of topics) {
      if (subs.has(unifiedTopic)) {
        try {
          if (unifiedTopic.startsWith('tickers.')) {
            const symbol = unifiedTopic.split('.')[1];
            ws.unsubscribeTopic('USDT-FUTURES', 'ticker', symbol);
          } else {
            const bitgetTopic: WsTopicV2 = mapUnifiedTopicToBitget(unifiedTopic);
            ws.unsubscribeTopic('USDT-FUTURES', bitgetTopic, 'default');
          }
          subs.delete(unifiedTopic);
        } catch (err) {
          this.logger.error(
            `Unsubscribe failed - AccountID: ${accountId} - Topic: ${unifiedTopic} - Error: ${err.message}`,
            err.stack
          );
          unsubFailures.push(unifiedTopic);
        }
      }
    }

    this.logger.log(
      `Unsubscribed - AccountID: ${accountId}, Successful: [${topics.filter(
        (t) => !unsubFailures.includes(t)
      )}], Failed: [${unsubFailures}]`
    );
  }

  private handleWsUpdate(accountId: string, message: any) {
    const channel = message?.arg?.channel;
    if (!channel) {
      this.logger.warn(`Unrecognized or missing channel in message: ${JSON.stringify(message)}`);
      return;
    }

    switch (channel) {
      case 'orders':
        this.handleOrdersAndExecutions(accountId, message);
        break;
      case 'positions':
        this.handlePositionUpdate(accountId, message);
        break;
      case 'account':
        this.handleWalletUpdate(accountId, message);
        break;
      case 'ticker':
        this.handleTickerUpdate(accountId, message);
        break;
      default:
        this.logger.warn(`Unrecognized topic: ${channel}`);
        break;
    }
  }

  private handleOrdersAndExecutions(accountId: string, message: any) {
    this.logger.debug(`handleOrdersAndExecutions - AccountID: ${accountId}`);
    const updates = message.data || [];

    for (const update of updates) {
      if (update.fillQty && Number(update.fillQty) > 0) {
        // “Execution” event
        this.logger.debug(`Emitting execution event - AccountID: ${accountId}`);
        this.eventEmitter.emit(Events.Data.EXECUTION_RECEIVED, new ExecutionDataReceivedEvent(accountId, [update]));
      } else {
        // “Order” event
        this.logger.debug(`Emitting order update - AccountID: ${accountId}`);
        this.eventEmitter.emit(Events.Data.ORDER_UPDATED, new OrderDataUpdatedEvent(accountId, [update]));
      }
    }
  }

  private handlePositionUpdate(accountId: string, message: any) {
    this.logger.debug(`handlePositionUpdate - AccountID: ${accountId}`);
    this.eventEmitter.emit(Events.Data.POSITION_UPDATED, new PositionDataUpdatedEvent(accountId, message.data));
  }

  private handleWalletUpdate(accountId: string, message: any) {
    this.logger.debug(`handleWalletUpdate - AccountID: ${accountId}`);
    this.eventEmitter.emit(Events.Data.WALLET_UPDATED, new WalletDataUpdatedEvent(accountId, message.data));
  }

  private handleTickerUpdate(accountId: string, message: any) {
    const marketId = message.arg?.instId || 'unknown';
    const tickerData = message.data?.[0] || {};
    // this.logger.debug(`handleTickerUpdate - AccountID: ${accountId}, MarketID: ${marketId}`);
    this.eventEmitter.emit(Events.Data.TICKER_UPDATED, new TickerDataUpdatedEvent(accountId, marketId, tickerData));
  }

  private cleanResources(accountId: string) {
    this.logger.debug(`Cleaning resources - AccountID: ${accountId}`);
    const ws = this.wsConnections.get(accountId);
    if (ws) {
      ws.closeAll();
      this.wsConnections.delete(accountId);
      this.subscriptions.delete(accountId);
      this.logger.log(`Cleaned resources - AccountID: ${accountId}`);
    }
  }
}
