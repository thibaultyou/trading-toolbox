import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as ccxt from 'ccxt';

@Injectable()
export class BitgetHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const exchange = new ccxt.bitget();
      await exchange.fetchTicker('BTCUSDT');
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('Bitget check failed', this.getStatus(key, false, { message: error.message }));
    }
  }
}
