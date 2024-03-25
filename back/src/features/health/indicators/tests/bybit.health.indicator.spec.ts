import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import * as ccxt from 'ccxt';

import { BybitHealthIndicator } from '../bybit.health.indicator';

jest.mock('ccxt', () => {
  const originalModule = jest.requireActual('ccxt');
  const bybitMock = {
    fetchTicker: jest.fn()
  };

  return {
    __esModule: true,
    ...originalModule,
    bybit: jest.fn().mockImplementation(() => bybitMock)
  };
});

describe('BybitHealthIndicator', () => {
  let bybitHealthIndicator: BybitHealthIndicator;
  let bybitMock: { fetchTicker: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    bybitMock = new ccxt.bybit() as any as { fetchTicker: jest.Mock };

    const module: TestingModule = await Test.createTestingModule({
      providers: [BybitHealthIndicator]
    }).compile();

    bybitHealthIndicator = module.get<BybitHealthIndicator>(BybitHealthIndicator);
  });

  it('should be defined', () => {
    expect(bybitHealthIndicator).toBeDefined();
  });

  it('should return a healthy result', async () => {
    const mockTicker = {
      symbol: 'BTCUSDT',
      info: {},
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      high: 10000,
      low: 8000,
      bid: 9500,
      ask: 9600
    };

    bybitMock.fetchTicker.mockResolvedValueOnce(mockTicker);

    const key = 'bybit';
    const result: HealthIndicatorResult = await bybitHealthIndicator.isHealthy(key);

    expect(result).toEqual({ [key]: { status: 'up' } });
    expect(bybitMock.fetchTicker).toHaveBeenCalledWith('BTCUSDT');
  });

  it('should throw a HealthCheckError on failure', async () => {
    const key = 'bybit';

    bybitMock.fetchTicker.mockRejectedValueOnce(new Error('Network error'));
    await expect(bybitHealthIndicator.isHealthy(key)).rejects.toThrow(HealthCheckError);
    expect(bybitMock.fetchTicker).toHaveBeenCalledWith('BTCUSDT');
  });
});
