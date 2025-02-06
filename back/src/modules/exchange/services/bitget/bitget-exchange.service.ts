import * as ccxt from 'ccxt';

import { Account } from '@account/entities/account.entity';

import { BaseExchangeService } from '../base-exchange.service';
import {
  ExchangeInitializationException,
  ExchangeOperationFailedException,
  InvalidCredentialsException
} from '../../exchange.exceptions';
import { Balances, Order, Position } from 'ccxt';
import { RestClientV2 } from 'bitget-api';
import { BitgetMapperService } from './bitget-mapper.service';

export class BitgetExchangeService extends BaseExchangeService {
  protected client: RestClientV2;
  private mapper: BitgetMapperService;

  constructor(account: Account) {
    super(account);
    this.mapper = new BitgetMapperService();
  }

  async initialize(): Promise<boolean> {
    try {
      this.exchange = new ccxt.bitget({
        apiKey: this.account.key,
        secret: this.account.secret,
        password: this.account.passphrase
      });
      this.client = new RestClientV2({
        apiKey: this.account.key,
        apiSecret: this.account.secret,
        apiPass: this.account.passphrase
      });
      await this.getBalances();
      return true;
    } catch (error) {
      if (error instanceof ccxt.AuthenticationError) {
        throw new InvalidCredentialsException(this.account.id);
      } else if (error instanceof ccxt.ExchangeError) {
        throw new ExchangeInitializationException(error.message);
      } else {
        throw error;
      }
    }
  }

  async getBalances(): Promise<Balances> {
    this.logger.debug(`Fetching balances - AccountID: ${this.account.id}`);

    try {
      const response = await this.client.getFuturesAccountAssets({ productType: 'USDT-FUTURES' });
      const { data, requestTime } = response;

      const balances = {} as Balances;
      balances.info = response;
      balances.timestamp = requestTime;
      balances.datetime = new Date(requestTime).toISOString();

      for (const entry of data) {
        const currency = entry.marginCoin;
        const free = parseFloat(entry.available);
        const used = parseFloat(entry.locked);
        const total = free + used;

        balances[currency] = {
          free,
          used,
          total
        };
      }

      this.logger.log(`Fetched balances - AccountID: ${this.account.id}`);
      return balances;
    } catch (error) {
      this.logger.error(
        `Failed to fetch balances - AccountID: ${this.account.id} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetching balances', error.message);
    }
  }

  async getOpenOrders(): Promise<Order[]> {
    this.logger.debug(`Fetching open orders - AccountID: ${this.account.id}`);
    try {
      const response = await this.client.getFuturesOpenOrders({ productType: 'USDT-FUTURES' });
      const openOrdersRaw = response?.data?.entrustedList || [];
      const mappedOrders = this.mapper.fromBitgetOpenOrdersToCCXTOrders(openOrdersRaw);
      this.logger.log(`Fetched open orders - AccountID: ${this.account.id} - Count: ${mappedOrders.length}`);
      return mappedOrders;
    } catch (error) {
      this.logger.error(
        `Failed to fetch open orders - AccountID: ${this.account.id} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetching open orders', error.message);
    }
  }

  async getOpenPositions(): Promise<Position[]> {
    this.logger.debug(`Fetching open positions - AccountID: ${this.account.id}`);
    try {
      const positions = await this.exchange.fetchPositions();
      const mappedPositions = positions.map((position: Position) => this.mapper.mapPosition(position));
      this.logger.log(`Fetched open positions - AccountID: ${this.account.id} - Count: ${mappedPositions.length}`);
      return mappedPositions;
    } catch (error) {
      this.logger.error(
        `Failed to fetch open positions - AccountID: ${this.account.id} - Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('fetching open positions', error.message);
    }
  }
}
