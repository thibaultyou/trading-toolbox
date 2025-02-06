import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as ccxt from 'ccxt';

@Injectable()
export class BybitHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const exchange = new ccxt.bybit();
      await exchange.fetchTicker('BTCUSDT');
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('Bybit check failed', this.getStatus(key, false, { message: error.message }));
    }
  }
}
