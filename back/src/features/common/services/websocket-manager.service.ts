import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebsocketClient, WsTopic } from 'bybit-api';

@Injectable()
export class WebsocketManagerService {
  private logger = new Logger(WebsocketManagerService.name);
  private wsConnections: Map<string, WebsocketClient> = new Map();
  private accountSubscriptions: Map<string, Set<string>> = new Map();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async initForAccount(accountId: string, options: any) {
    if (!this.wsConnections.has(accountId)) {
      const ws = new WebsocketClient(options);

      this.wsConnections.set(accountId, ws);
      this.accountSubscriptions.set(accountId, new Set());

      ws.on('update', (message: any) => this.handleWsUpdate(accountId, message));

      this.logger.log(`WebSocket connection initialized for account ${accountId}`);
    }
  }

  async subscribe(accountId: string, wsTopics: WsTopic[] | WsTopic, isPrivateTopic: boolean = false) {
    const ws = this.wsConnections.get(accountId);

    if (!ws) {
      this.logger.error(`No websocket client registered for account ${accountId}`);

      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subscriptions = this.accountSubscriptions.get(accountId);

    const topicsToSubscribe = topics.filter((topic) => !subscriptions?.has(topic));

    if (topicsToSubscribe.length > 0) {
      try {
        await ws.subscribe(topicsToSubscribe, isPrivateTopic);
        topicsToSubscribe.forEach((topic) => subscriptions?.add(topic));
        this.logger.log(`Subscribed to topics for account ${accountId}: ${topicsToSubscribe.join(', ')}`);
      } catch (error) {
        this.logger.error(`Error subscribing to topics for account ${accountId}: ${error.message}`);
      }
    }
  }

  unsubscribe(accountId: string, wsTopics: WsTopic[] | WsTopic, isPrivateTopic: boolean = false) {
    const ws = this.wsConnections.get(accountId);

    if (!ws) {
      this.logger.error(`No websocket client registered for account ${accountId}`);

      return;
    }

    const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
    const subscriptions = this.accountSubscriptions.get(accountId);

    topics.forEach((topic) => {
      if (subscriptions?.has(topic)) {
        try {
          ws.unsubscribe([topic], isPrivateTopic);
          subscriptions.delete(topic);
        } catch (error) {
          this.logger.error(`Error unsubscribing from topic ${topic} for account ${accountId}: ${error.message}`);
        }
      }
    });

    this.logger.log(`Unsubscribed from topics for account ${accountId}: ${topics.join(', ')}`);
  }

  private handleWsUpdate(accountId: string, message: any) {
    if (message?.topic) {
      this.eventEmitter.emit(`${message.topic}.${accountId}`, message.data);
      this.logger.log(`Message dispatched for topic ${message.topic} and account ${accountId}`);
    }
  }

  cleanResources(accountId: string) {
    const ws = this.wsConnections.get(accountId);

    if (ws) {
      ws.closeAll();
      this.wsConnections.delete(accountId);
      this.accountSubscriptions.delete(accountId);
      this.logger.log(`Cleaned up resources for account ${accountId}`);
    }
  }
}

// const options: WSClientConfigurableOptions = {
//   key: this.account.key,
//   secret: this.account.secret,
//   testnet: false,
//   market: 'contractUSDT',
// };

// this.ws = this.initWs(options);
// await this.initializeSubscriptions();

// async initializeSubscriptions(): Promise<void> {
//   const topics = ['execution']; // 'wallet', 'position', 'order'

//   try {
//     await this.ws.subscribe(topics);
//   } catch (error) {
//     this.logger.error(
//       `WebSocket subscription failed for ${this.account.name}: ${error.message}`,
//       error.stack,
//     );
//     throw new WebSocketSubscriptionException(
//       this.account.name,
//       error.message,
//     );
//   }
// }

// performWsAction(
//   accountId: string,
//   action: string,
//   topic: string,
//   actionDescription: string,
// ): void {
//   const exchange = this.getExchange(accountId);

//   try {
//     exchange.performWsAction(action, topic, actionDescription);
//     this.logger.log(
//       `WebSocket action performed: Account ${accountId}, Action: ${action}, Topic: ${topic}, Description: ${actionDescription}`,
//     );
//   } catch (error) {
//     this.logger.error(
//       `WebSocket action error: Account ${accountId}, Action: ${action}. Error: ${error.message}`,
//       error.stack,
//     );
//     throw new ExchangeOperationFailedException('performWsAction', error);
//   }
// }

// initWs(options: WSClientConfigurableOptions): WebsocketClient {
//   const ws = new WebsocketClient(options);

//   ws.on('update', this.handleWsUpdate.bind(this));

//   return ws;
// }

// // FIXME ticker related content need to move out in ticker module
// async subscribeToTickerUpdates(marketId: string): Promise<void> {
//   const topic = `tickers.${marketId}`;
//   try {
//     if (!this.subcriptions.has(topic)) {
//       await this.ws.subscribe([topic]);
//       this.subcriptions.add(topic);
//       this.logger.log(`Subscribed to ticker updates - MarketID: ${marketId}`);
//     }
//   } catch (error) {
//     this.logger.error(`Websocket subscription to ticker failed - MarketID: ${marketId}, Error: ${error.message}`, error.stack);
//     throw new ExchangeOperationFailedException('subscribeToTickerUpdates', error);
//   }
// }

// async subscribeTopics(topics: string[]): Promise<void> {
//   try {
//     await this.ws.subscribe(topics);
//   } catch (error) {
//     this.logger.error(
//       `WebSocket subscription failed: ${error.message}`,
//       error.stack,
//     );
//     throw new ExchangeOperationFailedException(
//       'WebSocket subscription',
//       error,
//     );
//   }
// }

// private handleWsUpdate(msg: any) {
//   if (msg?.topic) {
//     const topicHandlerMapping = {
//       'tickers.': this.handleTickerUpdate,
//       // execution: this.handleExecutionUpdate,
//       // FIXME update this
//       // position: this.handlePositionUpdate,
//       // order: this.handleOrderUpdate,
//       // wallet: this.handleWalletUpdate,
//     };

//     for (const [key, handler] of Object.entries(topicHandlerMapping)) {
//       if (msg.topic.startsWith(key)) {
//         handler.call(this, msg);

//         return;
//       }
//     }

//     this.logger.error(`Unsupported topic ${msg.topic}`);
//   }
// }

// private handleTickerUpdate(msg: any) {
//   this.eventEmitter.emit(
//     Events.UPDATE_TICKER,
//     new UpdateTickerEvent(this.account.id, msg.topic, msg.data),
//   );
//   this.logger.log(
//     `Ticker update received - Topic: ${msg.topic}, Data: ${JSON.stringify(msg.data)}`,
//   );
// }

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

// performWsAction(action: string, topic: string, actionDescription: string) {
//   try {
//     const tickerSymbol = topic.split('.')[1];

//     if (action === 'subscribe' && !this.subcriptions.has(tickerSymbol)) {
//       this.ws[action](topic);
//       this.subcriptions.add(tickerSymbol);
//     } else if (
//       action === 'unsubscribe' &&
//       this.subcriptions.has(tickerSymbol)
//     ) {
//       this.ws[action](topic);
//       this.subcriptions.delete(tickerSymbol);
//     } else {
//       this.logger.debug(`Ignoring ${actionDescription}`);

//       return;
//     }

//     this.logger.log(
//       `${
//         actionDescription.charAt(0).toUpperCase() + actionDescription.slice(1)
//       } ${topic}`,
//     );
//   } catch (error) {
//     throw new ExchangeOperationFailedException(
//       actionDescription,
//       error.message,
//     );
//   }
// }
