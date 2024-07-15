import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from '@health/health.controller';
import { BybitHealthIndicator } from '@health/indicators/bybit.health.indicator';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  const mockHealthCheckService = { check: jest.fn() };
  const mockTypeOrmHealthIndicator = { pingCheck: jest.fn() };
  const mockBybitHealthIndicator = { isHealthy: jest.fn() };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator
        },
        { provide: BybitHealthIndicator, useValue: mockBybitHealthIndicator }
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET) should return health status', async () => {
    mockHealthCheckService.check.mockImplementation(() =>
      Promise.resolve({
        status: 'ok',
        info: { database: { status: 'up' }, bybit: { status: 'up' } }
      })
    );

    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({
        status: 'ok',
        info: { database: { status: 'up' }, bybit: { status: 'up' } }
      });
  });

  it('/health (GET) when Bybit is not responding', async () => {
    mockHealthCheckService.check.mockImplementation(() =>
      Promise.resolve({
        status: 'error',
        info: {
          database: { status: 'up' },
          bybit: { status: 'down', message: 'Bybit check failed' }
        },
        error: { bybit: 'Bybit check failed' }
      })
    );

    await request(app.getHttpServer())
      .get('/health')
      .expect(503)
      .expect({
        status: 'error',
        info: {
          database: { status: 'up' },
          bybit: { status: 'down', message: 'Bybit check failed' }
        },
        error: { bybit: 'Bybit check failed' }
      });
  });

  it('/health (GET) when the database is not responding', async () => {
    mockHealthCheckService.check.mockImplementation(() =>
      Promise.resolve({
        status: 'error',
        info: {
          database: { status: 'down', message: 'Database check failed' },
          bybit: { status: 'up' }
        },
        error: { database: 'Database check failed' }
      })
    );

    await request(app.getHttpServer())
      .get('/health')
      .expect(503)
      .expect({
        status: 'error',
        info: {
          database: { status: 'down', message: 'Database check failed' },
          bybit: { status: 'up' }
        },
        error: { database: 'Database check failed' }
      });
  });
});
