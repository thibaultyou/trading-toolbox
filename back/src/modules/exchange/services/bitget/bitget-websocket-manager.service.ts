import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebsocketClientV2, DefaultLogger } from 'bitget-api';

import { AccountService } from '@account/account.service';
import { ConfigService } from '@config';
import { ExecutionDataReceivedEvent } from '@exchange/events/execution-data-received.event';
import { OrderDataUpdatedEvent } from '@exchange/events/order-data-updated.event';
import { PositionDataUpdatedEvent } from '@exchange/events/position-data-updated.event';
import { TickerDataUpdatedEvent } from '@exchange/events/ticker-data-updated.event';
import { WalletDataUpdatedEvent } from '@exchange/events/wallet-data-updated.event';
import { TrackingFailedException } from '@exchange/exceptions/exchange.exceptions';
import { IExchangeWebsocketService } from '@exchange/types/exchange-websocket-service.interface';

import { mapUnifiedTopicToBitget } from './bitget.utils';

@Injectable()
export class BitgetWebsocketManagerService implements IExchangeWebsocketService {
  private readonly logger = new Logger(BitgetWebsocketManagerService.name);
  private readonly wsConnections: Map<string, WebsocketClientV2> = new Map();
  private readonly subscriptions: Map<string, Set<string>> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly accountService: AccountService,
    private readonly configService: ConfigService
  ) {}

  async startTrackingAccount(accountId: string): Promise<void> {
    this.logger.debug(`startTrackingAccount() - start | accountId=${accountId}`);

    if (this.wsConnections.has(accountId)) {
      this.logger.warn(`startTrackingAccount() - skip | accountId=${accountId}, reason=Already tracking`);
      return;
    }

    try {
      const account = await this.accountService.getAccountByIdForSystem(accountId);
      const wsClient = new WebsocketClientV2(
        {
          apiKey: account.key,
          apiSecret: account.secret,
          apiPass: account.passphrase
        },
        DefaultLogger
      );
      wsClient.on('update', (message) => this.handleWsUpdate(accountId, message));

      this.wsConnections.set(accountId, wsClient);
      this.subscriptions.set(accountId, new Set<string>());

      await this.subscribe(accountId, ['execution', 'position', 'wallet'], true);

      this.logger.log(`startTrackingAccount() - success | accountId=${accountId}`);
    } catch (error) {
      this.logger.error(`startTrackingAccount() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw new TrackingFailedException(accountId, error);
    }
  }

  stopTrackingAccount(accountId: string): void {
    this.logger.debug(`stopTrackingAccount() - start | accountId=${accountId}`);

    if (this.wsConnections.has(accountId)) {
      this.cleanResources(accountId);
      this.logger.log(`stopTrackingAccount() - success | accountId=${accountId}`);
    } else {
      this.logger.warn(`stopTrackingAccount() - skip | accountId=${accountId}, reason=Not tracked`);
    }
  }

  async subscribe(accountId: string, wsTopics: string[] | string, _isPrivateTopic = false): Promise<void> {
    this.logger.debug(
      `subscribe() - start | accountId=${accountId}, topics=${Array.isArray(wsTopics) ? `[${wsTopics.join(',')}]` : wsTopics}`
    );

    let ws = this.wsConnections.get(accountId);

    if (!ws) {
      await this.startTrackingAccount(accountId);
      ws = this.wsConnections.get(accountId);
    }

    if (!ws) {
      this.logger.warn(`subscribe() - skip | accountId=${accountId}, reason=No WS client available`);
      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subs = this.subscriptions.get(accountId) || new Set<string>();
    const newTopics = topics.filter((t) => !subs.has(t));

    if (newTopics.length === 0) {
      this.logger.debug(`subscribe() - skip | accountId=${accountId}, reason=Already subscribed to these topics`);
      return;
    }

    try {
      for (const unifiedTopic of newTopics) {
        if (unifiedTopic.startsWith('tickers.')) {
          const symbol = unifiedTopic.split('.')[1];
          ws.subscribeTopic('USDT-FUTURES', 'ticker', symbol);
        } else {
          const bitgetTopic = mapUnifiedTopicToBitget(unifiedTopic);
          ws.subscribeTopic('USDT-FUTURES', bitgetTopic, 'default');
        }

        subs.add(unifiedTopic);
      }

      this.subscriptions.set(accountId, subs);
      this.logger.log(`subscribe() - success | accountId=${accountId}, topics=[${newTopics.join(', ')}]`);
    } catch (error) {
      this.logger.error(`subscribe() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
    }
  }

  unsubscribe(accountId: string, wsTopics: string[] | string, _isPrivateTopic = false): void {
    this.logger.debug(
      `unsubscribe() - start | accountId=${accountId}, topics=${
        Array.isArray(wsTopics) ? wsTopics.join(',') : wsTopics
      }`
    );

    const ws = this.wsConnections.get(accountId);

    if (!ws) {
      this.logger.warn(`unsubscribe() - skip | accountId=${accountId}, reason=No WS client found`);
      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subs = this.subscriptions.get(accountId) || new Set<string>();
    const unsubFailures: string[] = [];
    for (const unifiedTopic of topics) {
      if (subs.has(unifiedTopic)) {
        try {
          if (unifiedTopic.startsWith('tickers.')) {
            const symbol = unifiedTopic.split('.')[1];
            ws.unsubscribeTopic('USDT-FUTURES', 'ticker', symbol);
          } else {
            const bitgetTopic = mapUnifiedTopicToBitget(unifiedTopic);
            ws.unsubscribeTopic('USDT-FUTURES', bitgetTopic, 'default');
          }

          subs.delete(unifiedTopic);
        } catch (err) {
          this.logger.error(
            `unsubscribe() - error | accountId=${accountId}, topic=${unifiedTopic}, msg=${err.message}`,
            err.stack
          );
          unsubFailures.push(unifiedTopic);
        }
      }
    }

    this.logger.log(`unsubscribe() - complete | accountId=${accountId}, unsubFailed=[${unsubFailures.join(', ')}]`);
  }

  private handleWsUpdate(accountId: string, message: any): void {
    const channel = message?.arg?.channel;

    if (!channel) {
      this.logger.warn(
        `handleWsUpdate() - skip | accountId=${accountId}, reason=Missing or unrecognized channel in message`
      );
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
        this.logger.warn(
          `handleWsUpdate() - skip | accountId=${accountId}, channel=${channel}, reason=Unrecognized topic`
        );
        break;
    }
  }

  private handleOrdersAndExecutions(accountId: string, message: any): void {
    this.logger.debug(`handleOrdersAndExecutions() - start | accountId=${accountId}`);
    const updates = message.data || [];
    for (const update of updates) {
      const fillQty = Number(update.fillQty || '0');

      if (fillQty > 0) {
        // Execution event
        this.logger.debug(`handleOrdersAndExecutions() - execution | accountId=${accountId}`);
        this.eventEmitter.emit(
          this.configService.events.Data.EXECUTION_RECEIVED,
          new ExecutionDataReceivedEvent(accountId, [update])
        );
      } else {
        // Order event
        this.logger.debug(`handleOrdersAndExecutions() - orderUpdate | accountId=${accountId}`);
        this.eventEmitter.emit(
          this.configService.events.Data.ORDER_UPDATED,
          new OrderDataUpdatedEvent(accountId, [update])
        );
      }
    }
  }

  private handlePositionUpdate(accountId: string, message: any): void {
    this.logger.debug(`handlePositionUpdate() - start | accountId=${accountId}`);
    this.eventEmitter.emit(
      this.configService.events.Data.POSITION_UPDATED,
      new PositionDataUpdatedEvent(accountId, message.data)
    );
  }

  private handleTickerUpdate(accountId: string, message: any): void {
    // NOTE Avoiding logs here to prevent high frequency noise
    const marketId = message.arg?.instId || 'unknown';
    const tickerData = message.data?.[0] || {};
    // this.logger.debug(`handleTickerUpdate() - start | accountId=${accountId}, marketId=${marketId}`);
    this.eventEmitter.emit(
      this.configService.events.Data.TICKER_UPDATED,
      new TickerDataUpdatedEvent(accountId, marketId, tickerData)
    );
  }

  private handleWalletUpdate(accountId: string, message: any): void {
    this.logger.debug(`handleWalletUpdate() - start | accountId=${accountId}`);
    this.eventEmitter.emit(
      this.configService.events.Data.WALLET_UPDATED,
      new WalletDataUpdatedEvent(accountId, message.data)
    );
  }

  private cleanResources(accountId: string): void {
    this.logger.debug(`cleanResources() - start | accountId=${accountId}`);

    try {
      const ws = this.wsConnections.get(accountId);

      if (ws) {
        ws.closeAll();
        this.wsConnections.delete(accountId);
        this.subscriptions.delete(accountId);
        this.logger.log(`cleanResources() - success | accountId=${accountId}`);
      }
    } catch (error) {
      this.logger.error(`cleanResources() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
    }
  }
}
