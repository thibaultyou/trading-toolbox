import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Timers } from '@config';
import { IExecutionData } from '@exchange/types/execution-data.interface';

import { StrategyCreateRequestDto } from './dtos/strategy-create.request.dto';
import { StrategyUpdateRequestDto } from './dtos/strategy-update.request.dto';
import { Strategy } from './entities/strategy.entity';
import { StrategyNotFoundException } from './exceptions/strategy.exceptions';
import { StrategyMapperService } from './services/strategy-mapper.service';
import { StrategyFactory } from './strategies/strategy.factory';

@Injectable()
export class StrategyService {
  private readonly logger = new Logger(StrategyService.name);

  constructor(
    @InjectRepository(Strategy)
    private readonly strategyRepository: Repository<Strategy>,
    private readonly strategyFactory: StrategyFactory,
    private readonly strategyMapper: StrategyMapperService
  ) {}

  @Interval(Timers.STRATEGIES_CHECK_COOLDOWN)
  loop(): void {
    this.processStrategies();
  }

  async getAllStrategies(userId: string): Promise<Strategy[]> {
    this.logger.debug(`getAllStrategies() - start | userId=${userId}`);

    const strategies = await this.strategyRepository.find({ where: { userId } });
    this.logger.log(`getAllStrategies() - success | userId=${userId}, count=${strategies.length}`);
    return strategies;
  }

  async getAllStrategiesForSystem(): Promise<Strategy[]> {
    this.logger.debug(`getAllStrategiesForSystem() - start`);

    const strategies = await this.strategyRepository.find();
    this.logger.log(`getAllStrategiesForSystem() - success | count=${strategies.length}`);
    return strategies;
  }

  async getStrategyById(userId: string, id: string): Promise<Strategy> {
    this.logger.debug(`getStrategyById() - start | userId=${userId}, strategyId=${id}`);

    const strategy = await this.strategyRepository.findOne({
      where: { id, userId }
    });

    if (!strategy) {
      this.logger.warn(`getStrategyById() - not found | userId=${userId}, strategyId=${id}`);
      throw new StrategyNotFoundException(id);
    }

    this.logger.debug(`getStrategyById() - success | userId=${userId}, strategyId=${id}`);
    return strategy;
  }

  async createStrategy(userId: string, dto: StrategyCreateRequestDto): Promise<Strategy> {
    this.logger.debug(`createStrategy() - start | userId=${userId}`);

    const strategy = this.strategyMapper.createFromDto(dto, userId);
    const savedStrategy = await this.strategyRepository.save(strategy);
    this.logger.log(
      `createStrategy() - success | userId=${userId}, strategyId=${savedStrategy.id}, type=${savedStrategy.type}`
    );
    return savedStrategy;
  }

  async updateStrategy(userId: string, id: string, dto: StrategyUpdateRequestDto): Promise<Strategy> {
    this.logger.debug(`updateStrategy() - start | userId=${userId}, strategyId=${id}`);

    const strategy = await this.getStrategyById(userId, id);
    const updatedStrategy = this.strategyMapper.updateFromDto(strategy, dto);
    const savedStrategy = await this.strategyRepository.save(updatedStrategy);
    this.logger.log(`updateStrategy() - success | userId=${userId}, strategyId=${id}`);
    return savedStrategy;
  }

  async deleteStrategy(userId: string, id: string): Promise<boolean> {
    this.logger.debug(`deleteStrategy() - start | userId=${userId}, strategyId=${id}`);

    const strategy = await this.getStrategyById(userId, id);
    await this.strategyRepository.remove(strategy);

    this.logger.log(`deleteStrategy() - success | userId=${userId}, strategyId=${id}`);
    return true;
  }

  async processOrderExecutionData(executionData: IExecutionData) {
    this.logger.debug(`processOrderExecutionData() - start | orderId=${executionData.orderId}`);

    const relevantStrategies = await this.strategyRepository.find({
      where: { orders: executionData.orderId }
    });
    this.logger.debug(
      `processOrderExecutionData() - found strategies | count=${relevantStrategies.length}, orderId=${executionData.orderId}`
    );

    await Promise.all(
      relevantStrategies.map(async (strategy) => {
        try {
          const instance = this.strategyFactory.createStrategy(strategy.type);
          this.logger.debug(
            `processOrderExecutionData() - handleExecution | strategyId=${strategy.id}, orderId=${executionData.orderId}`
          );

          await instance.handleOrderExecution(strategy.accountId, strategy, executionData);

          this.logger.debug(
            `processOrderExecutionData() - success | strategyId=${strategy.id}, orderId=${executionData.orderId}`
          );

          await this.strategyRepository.save(strategy);
        } catch (error) {
          this.logger.error(
            `processOrderExecutionData() - error | strategyId=${strategy.id}, orderId=${executionData.orderId}, msg=${error.message}`,
            error.stack
          );
        }
      })
    );

    this.logger.debug(`processOrderExecutionData() - complete | orderId=${executionData.orderId}`);
  }

  private async processStrategy(strategy: Strategy) {
    this.logger.debug(`processStrategy() - start | strategyId=${strategy.id}`);
    const instance = this.strategyFactory.createStrategy(strategy.type);

    try {
      await instance.process(strategy.accountId, strategy);
      this.logger.log(`processStrategy() - success | strategyId=${strategy.id}`);
    } catch (error) {
      this.logger.error(`processStrategy() - error | strategyId=${strategy.id}, msg=${error.message}`, error.stack);
    }
  }

  private async processStrategies() {
    this.logger.debug('processStrategies() - start');

    try {
      const strategies = await this.getAllStrategiesForSystem();
      this.logger.debug(`processStrategies() - info | count=${strategies.length}`);

      const promises = strategies.map((strategy) =>
        this.processStrategy(strategy).catch((strategyError) => {
          this.logger.error(
            `processStrategies() - errorInsideMap | strategyId=${strategy.id}, msg=${strategyError.message}`,
            strategyError.stack
          );
        })
      );
      await Promise.all(promises);

      this.logger.debug('processStrategies() - complete');
    } catch (error) {
      this.logger.error(`processStrategies() - error | msg=${error.message}`, error.stack);
    }
  }
}
