import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebsocketClient, WSClientConfigurableOptions } from 'bybit-api';

import { AccountService } from '@account/account.service';
import { Events } from '@config';
import { TrackingFailedException } from '@exchange/exceptions/exchange.exceptions';

import { ExecutionDataReceivedEvent } from '../../events/execution-data-received.event';
import { OrderDataUpdatedEvent } from '../../events/order-data-updated.event';
import { PositionDataUpdatedEvent } from '../../events/position-data-updated.event';
import { TickerDataUpdatedEvent } from '../../events/ticker-data-updated.event';
import { WalletDataUpdatedEvent } from '../../events/wallet-data-updated.event';
import { IExchangeWebsocketService } from '../../types/exchange-websocket-service.interface';

@Injectable()
export class BybitWebsocketManagerService implements IExchangeWebsocketService {
  private readonly logger = new Logger(BybitWebsocketManagerService.name);
  private readonly wsConnections: Map<string, WebsocketClient> = new Map();
  private readonly subscriptions: Map<string, Set<string>> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly accountService: AccountService
  ) {}

  async startTrackingAccount(accountId: string): Promise<void> {
    this.logger.debug(`startTrackingAccount() - start | accountId=${accountId}`);

    if (this.wsConnections.has(accountId)) {
      this.logger.warn(`startTrackingAccount() - skip | accountId=${accountId}, reason=Already tracking`);
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

  async subscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic = false): Promise<void> {
    const topicsLog = Array.isArray(wsTopics) ? wsTopics.join(', ') : wsTopics;
    this.logger.debug(`subscribe() - start | accountId=${accountId}, topics=[${topicsLog}]`);
    let ws = this.wsConnections.get(accountId);

    if (!ws) {
      await this.startTrackingAccount(accountId);
      ws = this.wsConnections.get(accountId);
    }

    if (!ws) {
      this.logger.warn(`subscribe() - skip | accountId=${accountId}, reason=No WebSocket client`);
      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subscriptions = this.subscriptions.get(accountId) || new Set<string>();
    const newTopics = topics.filter((topic) => !subscriptions.has(topic));

    if (!newTopics.length) {
      this.logger.debug(`subscribe() - skip | accountId=${accountId}, reason=Already subscribed`);
      return;
    }

    try {
      await ws.subscribeV5(newTopics, 'linear', isPrivateTopic);
      newTopics.forEach((t) => subscriptions.add(t));
      this.subscriptions.set(accountId, subscriptions);
      this.logger.log(`subscribe() - success | accountId=${accountId}, topics=[${newTopics.join(', ')}]`);
    } catch (error) {
      this.logger.error(`subscribe() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
    }
  }

  unsubscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic = false): void {
    const topicsLog = Array.isArray(wsTopics) ? wsTopics.join(', ') : wsTopics;
    this.logger.debug(`unsubscribe() - start | accountId=${accountId}, topics=[${topicsLog}]`);
    const ws = this.wsConnections.get(accountId);

    if (!ws) {
      this.logger.warn(`unsubscribe() - skip | accountId=${accountId}, reason=No WS client`);
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
            `unsubscribe() - error | accountId=${accountId}, topic=${topic}, msg=${err.message}`,
            err.stack
          );
          unsubFailures.push(topic);
        }
      }
    });
    this.logger.log(
      `unsubscribe() - complete | accountId=${accountId}, success=[${topics.filter(
        (t) => !unsubFailures.includes(t)
      )}], failed=[${unsubFailures}]`
    );
  }

  private handleWsUpdate(accountId: string, message: any): void {
    this.logger.debug(`handleWsUpdate() - start | accountId=${accountId}, topic=${message?.topic || 'unknown'}`);

    if (message?.topic) {
      const mapping: Record<string, (a: string, m: any) => void> = {
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
      this.logger.warn(`handleWsUpdate() - skip | accountId=${accountId}, unrecognizedTopic=${message.topic}`);
    }
  }

  private handleExecutionUpdate(accountId: string, message: any): void {
    this.logger.debug(`handleExecutionUpdate() - start | accountId=${accountId}`);
    this.eventEmitter.emit(Events.Data.EXECUTION_RECEIVED, new ExecutionDataReceivedEvent(accountId, message.data));
  }

  private handleOrderUpdate(accountId: string, message: any): void {
    this.logger.debug(`handleOrderUpdate() - start | accountId=${accountId}`);
    this.eventEmitter.emit(Events.Data.ORDER_UPDATED, new OrderDataUpdatedEvent(accountId, message.data));
  }

  private handlePositionUpdate(accountId: string, message: any): void {
    this.logger.debug(`handlePositionUpdate() - start | accountId=${accountId}`);
    this.eventEmitter.emit(Events.Data.POSITION_UPDATED, new PositionDataUpdatedEvent(accountId, message.data));
  }

  private handleTickerUpdate(accountId: string, message: any): void {
    // NOTE Avoiding logs here to prevent high frequency noise
    const marketId = message.topic.substring('tickers.'.length);
    // this.logger.debug(`handleTickerUpdate() - start | accountId=${accountId}, marketId=${marketId}`);
    this.eventEmitter.emit(Events.Data.TICKER_UPDATED, new TickerDataUpdatedEvent(accountId, marketId, message.data));
  }

  private handleWalletUpdate(accountId: string, message: any): void {
    this.logger.debug(`handleWalletUpdate() - start | accountId=${accountId}`);
    this.eventEmitter.emit(Events.Data.WALLET_UPDATED, new WalletDataUpdatedEvent(accountId, message.data));
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
