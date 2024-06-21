import { HttpStatus } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { HealthController } from './health.controller';
import { BybitHealthIndicator } from './indicators/bybit.health.indicator';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthCheckService, TypeOrmHealthIndicator, BybitHealthIndicator]
    })
      .overrideProvider(HealthCheckService)
      .useValue({
        check: jest.fn()
      })
      .overrideProvider(TypeOrmHealthIndicator)
      .useValue({
        pingCheck: jest.fn()
      })
      .overrideProvider(BybitHealthIndicator)
      .useValue({
        isHealthy: jest.fn()
      })
      .compile();
    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when all services are healthy', () => {
    it('should return a 200 status', async () => {
      jest.spyOn(healthCheckService, 'check').mockImplementation(() =>
        Promise.resolve({
          status: 'ok',
          info: {
            database: { status: 'up' },
            bybit: { status: 'up' }
          },
          details: {
            database: {
              status: 'up'
            },
            bybit: {
              status: 'up'
            }
          }
        })
      );

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;
      await controller.check(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok'
        })
      );
    });
  });

  describe('when Bybit service is down', () => {
    it('should return a 503 status', async () => {
      jest.spyOn(healthCheckService, 'check').mockImplementation(() =>
        Promise.resolve({
          status: 'error',
          info: {
            database: { status: 'up' },
            bybit: { status: 'down', message: 'Bybit check failed' }
          },
          details: {
            database: { status: 'up' },
            bybit: { status: 'down', message: 'Bybit check failed' }
          },
          error: {
            bybit: { status: 'down' }
          }
        })
      );

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;
      await controller.check(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: {
            bybit: { status: 'down' }
          }
        })
      );
    });
  });

  describe('when the database service is down', () => {
    it('should return a 503 status', async () => {
      jest.spyOn(healthCheckService, 'check').mockImplementation(() =>
        Promise.resolve({
          status: 'error',
          info: {
            database: { status: 'down', message: 'Database check failed' },
            bybit: { status: 'up' }
          },
          error: {
            database: { status: 'down' }
          },
          details: {}
        })
      );

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;
      await controller.check(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: {
            database: { status: 'down' }
          }
        })
      );
    });
  });
});
