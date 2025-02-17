import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from '@health/health.controller';
import { BybitHealthIndicator } from '@health/indicators/bybit.health.indicator';
import { BitgetHealthIndicator } from '@health/indicators/bitget.health.indicator';

describe('Health Module (e2e)', () => {
  let app: INestApplication;

  const mockHealthCheckService = { check: jest.fn() };
  const mockTypeOrmHealthIndicator = { pingCheck: jest.fn() };
  const mockBybitHealthIndicator = { isHealthy: jest.fn() };
  const mockBitgetHealthIndicator = { isHealthy: jest.fn() };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: mockTypeOrmHealthIndicator },
        { provide: BybitHealthIndicator, useValue: mockBybitHealthIndicator },
        { provide: BitgetHealthIndicator, useValue: mockBitgetHealthIndicator }
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('GET /health - should return health status when all dependencies are healthy', async () => {
    mockHealthCheckService.check.mockImplementation(() =>
      Promise.resolve({
        status: 'ok',
        info: {
          database: { status: 'up' },
          bybit: { status: 'up' },
          bitget: { status: 'up' }
        },
        error: {}
      })
    );

    await request(app.getHttpServer())
      .get('/health')
      .expect(HttpStatus.OK)
      .expect({
        status: 'ok',
        info: {
          database: { status: 'up' },
          bybit: { status: 'up' },
          bitget: { status: 'up' }
        }
      });
  });

  it('GET /health - should return SERVICE_UNAVAILABLE when Bybit is not responding', async () => {
    mockHealthCheckService.check.mockImplementation(() =>
      Promise.resolve({
        status: 'error',
        info: {
          database: { status: 'up' },
          bybit: { status: 'down', message: 'Bybit check failed' },
          bitget: { status: 'up' }
        },
        error: { bybit: 'Bybit check failed' }
      })
    );

    await request(app.getHttpServer())
      .get('/health')
      .expect(HttpStatus.SERVICE_UNAVAILABLE)
      .expect({
        status: 'error',
        info: {
          database: { status: 'up' },
          bybit: { status: 'down', message: 'Bybit check failed' },
          bitget: { status: 'up' }
        },
        error: { bybit: 'Bybit check failed' }
      });
  });

  it('GET /health - should return SERVICE_UNAVAILABLE when the database is not responding', async () => {
    mockHealthCheckService.check.mockImplementation(() =>
      Promise.resolve({
        status: 'error',
        info: {
          database: { status: 'down', message: 'Database check failed' },
          bybit: { status: 'up' },
          bitget: { status: 'up' }
        },
        error: { database: 'Database check failed' }
      })
    );

    await request(app.getHttpServer())
      .get('/health')
      .expect(HttpStatus.SERVICE_UNAVAILABLE)
      .expect({
        status: 'error',
        info: {
          database: { status: 'down', message: 'Database check failed' },
          bybit: { status: 'up' },
          bitget: { status: 'up' }
        },
        error: { database: 'Database check failed' }
      });
  });

  it('GET /health - should return SERVICE_UNAVAILABLE when Bitget is not responding', async () => {
    mockHealthCheckService.check.mockImplementation(() =>
      Promise.resolve({
        status: 'error',
        info: {
          database: { status: 'up' },
          bybit: { status: 'up' },
          bitget: { status: 'down', message: 'Bitget check failed' }
        },
        error: { bitget: 'Bitget check failed' }
      })
    );

    await request(app.getHttpServer())
      .get('/health')
      .expect(HttpStatus.SERVICE_UNAVAILABLE)
      .expect({
        status: 'error',
        info: {
          database: { status: 'up' },
          bybit: { status: 'up' },
          bitget: { status: 'down', message: 'Bitget check failed' }
        },
        error: { bitget: 'Bitget check failed' }
      });
  });
});
