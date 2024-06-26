import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Timers } from '../../config';
import { IExecutionData } from '../core/types/execution-data.interface';
import { BaseStrategy } from './strategies/base-strategy';
import { StrategyFactory } from './strategies/strategy.factory';
import { CurrencyMode } from './types/currency-mode.enum';
import { IStrategy } from './types/strategy.interface';
import { StrategyType } from './types/strategy-type.enum';

const fakeStrategy = {
  accountId: '1660782b-9765-4ede-9f0f-94d235bbc170',
  strategies: [
    {
      id: '1',
      type: StrategyType.FIBONACCI_MARTINGALE,
      marketId: 'FTMUSDT',
      options: {
        currencyMode: CurrencyMode.QUOTE,
        baseOrderSize: 30,
        safetyOrderSize: 20,
        safetyOrderStepScale: 1.7,
        safetyOrderVolumeScale: 2.8,
        initialSafetyOrderDistancePct: 0.89,
        takeProfitPercentage: 1.49,
        maxSafetyOrdersCount: 4
      },
      orders: []
    }
  ]
};
interface StrategyInfo {
  config: IStrategy;
  instance: BaseStrategy;
}

@Injectable()
export class StrategyService implements OnModuleInit {
  private logger = new Logger(StrategyService.name);
  private strategies: Map<string, Map<string, StrategyInfo>> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private strategyFactory: StrategyFactory
  ) {}

  async onModuleInit() {
    const initialStrategies = await this.fetchAllInitialStrategies();
    initialStrategies.forEach(({ accountId, strategies }) => {
      strategies.forEach((strategy) => {
        this.addStrategy(accountId, strategy);
      });
    });
    setInterval(() => {
      this.processStrategies();
    }, Timers.STRATEGIES_CHECK_COOLDOWN);
  }

  private async fetchAllInitialStrategies(): Promise<{ accountId: string; strategies: IStrategy[] }[]> {
    return [fakeStrategy];
  }

  addStrategy(accountId: string, strategyConfig: IStrategy) {
    if (!this.strategies.has(accountId)) {
      this.strategies.set(accountId, new Map());
    }

    const accountStrategies = this.strategies.get(accountId);
    const strategyInstance = this.strategyFactory.createStrategy(strategyConfig.type);
    accountStrategies.set(strategyConfig.id, {
      config: strategyConfig,
      instance: strategyInstance
    });

    this.logger.log(`Strategy - Added - AccountID: ${accountId}, StrategyID: ${strategyConfig.id}`);
    // this.eventEmitter.emit(Events.STRATEGY_ADDED, new StrategyAddedEvent(accountId, strategyConfig));
  }

  removeStrategy(accountId: string, strategyId: string) {
    const accountStrategies = this.strategies.get(accountId);

    if (accountStrategies && accountStrategies.has(strategyId)) {
      accountStrategies.delete(strategyId);
      this.logger.log(`Strategy - Removed - AccountID: ${accountId}, StrategyID: ${strategyId}`);
    }
  }

  getStrategies(accountId: string): IStrategy[] {
    const accountStrategies = this.strategies.get(accountId);
    return accountStrategies ? Array.from(accountStrategies.values()).map((info) => info.config) : [];
  }

  async processOrderExecutionData(accountId: string, executionData: IExecutionData) {
    this.logger.log(`Strategy - Processing Order Execution Data - AccountID: ${accountId}`);
    const accountStrategies = this.strategies.get(accountId);

    if (!accountStrategies) {
      this.logger.warn(
        `Strategy - Processing Order Execution Data Failed - AccountID: ${accountId}, Reason: Account not found`
      );
      return;
    }

    const relevantStrategies = Array.from(accountStrategies.values()).filter(
      ({ config }) => config.marketId === executionData.symbol
    );
    await Promise.all(
      relevantStrategies.map(async ({ config, instance }) => {
        await instance.handleOrderExecution(accountId, config, executionData);
      })
    );
  }

  async processStrategy(accountId: string, strategyId: string): Promise<void> {
    const accountStrategies = this.strategies.get(accountId);

    if (!accountStrategies) {
      this.logger.warn(`Strategy - Processing Failed - AccountID: ${accountId}, Reason: Account not found`);
      return;
    }

    const strategyInfo = accountStrategies.get(strategyId);

    if (!strategyInfo) {
      this.logger.warn(
        `Strategy - Processing Failed - AccountID: ${accountId}, StrategyID: ${strategyId}, Reason: Strategy not found`
      );
      return;
    }

    this.logger.debug(`Strategy - Processing - AccountID: ${accountId}, StrategyID: ${strategyId}`);
    await strategyInfo.instance.process(accountId, strategyInfo.config);
  }

  async processStrategies() {
    this.logger.debug(`Strategy - Processing Strategies`);
    for (const [accountId, accountStrategies] of this.strategies) {
      for (const [strategyId] of accountStrategies) {
        await this.processStrategy(accountId, strategyId);
      }
    }
  }

  updateStrategyConfig(accountId: string, strategyId: string, newConfig: Partial<IStrategy>) {
    const accountStrategies = this.strategies.get(accountId);

    if (accountStrategies && accountStrategies.has(strategyId)) {
      const strategyInfo = accountStrategies.get(strategyId);
      strategyInfo.config = { ...strategyInfo.config, ...newConfig };
      this.logger.log(`Strategy - Config Updated - AccountID: ${accountId}, StrategyID: ${strategyId}`);
    }
  }
}