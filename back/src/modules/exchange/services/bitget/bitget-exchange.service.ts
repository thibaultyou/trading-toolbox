import { RestClientV2 } from 'bitget-api';
import * as ccxt from 'ccxt';
import { Balances, Order, Position } from 'ccxt';

import { Account } from '@account/entities/account.entity';

import { BitgetMapperService } from './bitget-mapper.service';
import {
  ExchangeInitializationException,
  ExchangeOperationFailedException,
  InvalidCredentialsException
} from '../../exceptions/exchange.exceptions';
import { BaseExchangeService } from '../base-exchange.service';

export class BitgetExchangeService extends BaseExchangeService {
  protected client: RestClientV2;
  private mapper: BitgetMapperService;

  constructor(account: Account) {
    super(account);
    this.mapper = new BitgetMapperService();
  }

  async initialize(): Promise<boolean> {
    this.logger.debug(`initialize() - start | accountId=${this.account.id}`);

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

      this.logger.log(`initialize() - success | accountId=${this.account.id}`);
      return true;
    } catch (error) {
      this.logger.error(`initialize() - error | accountId=${this.account.id}, msg=${error.message}`, error.stack);

      if (error instanceof ccxt.AuthenticationError) {
        throw new InvalidCredentialsException(this.account.id);
      } else if (error instanceof ccxt.ExchangeError) {
        throw new ExchangeInitializationException(error.message);
      }

      throw error;
    }
  }

  async getBalances(): Promise<Balances> {
    this.logger.debug(`getBalances() - start | accountId=${this.account.id}`);

    try {
      const response = await this.client.getFuturesAccountAssets({ productType: 'USDT-FUTURES' });
      const { data, requestTime } = response;
      const balances = {
        info: response,
        timestamp: requestTime,
        datetime: new Date(requestTime).toISOString()
      } as Balances;
      // Build the structure required by ccxt's Balances
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

      this.logger.log(`getBalances() - success | accountId=${this.account.id}`);
      return balances;
    } catch (error) {
      this.logger.error(`getBalances() - error | accountId=${this.account.id}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getBalances', error.message);
    }
  }

  async getOpenOrders(): Promise<Order[]> {
    this.logger.debug(`getOpenOrders() - start | accountId=${this.account.id}`);

    try {
      const response = await this.client.getFuturesOpenOrders({ productType: 'USDT-FUTURES' });
      const openOrdersRaw = response?.data?.entrustedList || [];
      const mappedOrders = this.mapper.fromBitgetOpenOrdersToCCXTOrders(openOrdersRaw);
      this.logger.log(`getOpenOrders() - success | accountId=${this.account.id}, count=${mappedOrders.length}`);
      return mappedOrders;
    } catch (error) {
      this.logger.error(`getOpenOrders() - error | accountId=${this.account.id}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getOpenOrders', error.message);
    }
  }

  async getClosedOrders(symbol?: string): Promise<Order[]> {
    this.logger.debug(`getClosedOrders() - start | accountId=${this.account.id}, symbol=${symbol || ''}`);

    try {
      const response = await this.client.getFuturesHistoricOrders({
        productType: 'USDT-FUTURES'
      });
      const closedOrdersRaw = response.data?.entrustedList || [];
      const mappedOrders = this.mapper.fromBitgetClosedOrdersToCCXTOrders(closedOrdersRaw);
      this.logger.log(`getClosedOrders() - success | accountId=${this.account.id}, count=${mappedOrders.length}`);
      return mappedOrders;
    } catch (error) {
      this.logger.error(`getClosedOrders() - error | accountId=${this.account.id}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getClosedOrders', error.message);
    }
  }

  async getOrders(symbol?: string): Promise<Order[]> {
    const symbolLog = symbol ? `, symbol=${symbol}` : '';
    this.logger.debug(`getOrders() - start | accountId=${this.account.id}${symbolLog}`);

    try {
      const openOrders = await this.getOpenOrders();
      const closedOrders = await this.getClosedOrders(symbol);
      const merged = [...openOrders, ...closedOrders];
      this.logger.log(`getOrders() - success | accountId=${this.account.id}, total=${merged.length}${symbolLog}`);
      return merged;
    } catch (error) {
      this.logger.error(
        `getOrders() - error | accountId=${this.account.id}${symbolLog}, msg=${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('getOrders', error.message);
    }
  }

  async getOpenPositions(): Promise<Position[]> {
    this.logger.debug(`getOpenPositions() - start | accountId=${this.account.id}`);

    try {
      const positions = await this.exchange.fetchPositions();
      const mappedPositions = positions.map((p: Position) => this.mapper.mapPosition(p));
      this.logger.log(`getOpenPositions() - success | accountId=${this.account.id}, count=${mappedPositions.length}`);
      return mappedPositions;
    } catch (error) {
      this.logger.error(`getOpenPositions() - error | accountId=${this.account.id}, msg=${error.message}`, error.stack);
      throw new ExchangeOperationFailedException('getOpenPositions', error.message);
    }
  }
}
