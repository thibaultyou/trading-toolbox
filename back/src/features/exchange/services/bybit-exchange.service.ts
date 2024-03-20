import { WSClientConfigurableOptions } from 'bybit-api';
import * as ccxt from 'ccxt';

import {
  ExchangeInitializationException,
  InvalidCredentialsException,
  WebSocketSubscriptionException,
} from '../exceptions/exchange.exceptions';

import { AbstractExchangeService } from './abstract-exchange.service';

export class BybitExchangeService extends AbstractExchangeService {
  async initialize(): Promise<void> {
    try {
      this.exchange = new ccxt.bybit({
        apiKey: this.account.key,
        secret: this.account.secret,
      });

      await this.testCredentials();

      const options: WSClientConfigurableOptions = {
        key: this.account.key,
        secret: this.account.secret,
        testnet: false,
        market: 'contractUSDT',
      };
      this.ws = this.initWs(options);
      await this.initializeSubscriptions();
    } catch (error) {
      if (error instanceof ccxt.AuthenticationError) {
        throw new InvalidCredentialsException(this.account.name);
      }
      throw new ExchangeInitializationException(error.message);
    }
  }

  async initializeSubscriptions(): Promise<void> {
    const topics = ['execution']; // 'wallet', 'position', 'order'
    try {
      await this.ws.subscribe(topics);
    } catch (error) {
      this.logger.error(
        `WebSocket subscription failed for ${this.account.name}: ${error.message}`,
        error.stack,
      );
      throw new WebSocketSubscriptionException(
        this.account.name,
        error.message,
      );
    }
  }
}
