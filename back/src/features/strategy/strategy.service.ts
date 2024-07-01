import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Timers } from '../../config';
import { IExecutionData } from '../core/types/execution-data.interface';
import { StrategyCreateRequestDto } from './dtos/strategy-create.request.dto';
import { StrategyUpdateRequestDto } from './dtos/strategy-update.request.dto';
import { Strategy } from './entities/strategy.entity';
import { StrategyNotFoundException } from './exceptions/strategy.exceptions';
import { StrategyFactory } from './strategies/strategy.factory';

@Injectable()
export class StrategyService implements OnModuleInit {
  private logger = new Logger(StrategyService.name);

  constructor(
    @InjectRepository(Strategy)
    private strategyRepository: Repository<Strategy>,
    private strategyFactory: StrategyFactory
  ) {}

  async onModuleInit() {
    this.logger.debug('Initializing module');
    setInterval(() => {
      this.processStrategies();
    }, Timers.STRATEGIES_CHECK_COOLDOWN);
    this.logger.log('Module initialized successfully');
  }

  async getAllStrategies(): Promise<Strategy[]> {
    this.logger.debug('Fetching all strategies');
    const strategies = await this.strategyRepository.find();
    this.logger.log(`Fetched strategies - Count: ${strategies.length}`);
    return strategies;
  }

  async getStrategyById(id: string): Promise<Strategy> {
    this.logger.debug(`Fetching strategy - StrategyID: ${id}`);
    const strategy = await this.strategyRepository.findOne({ where: { id } });

    if (!strategy) {
      this.logger.warn(`Strategy not found - StrategyID: ${id}`);
      throw new StrategyNotFoundException(id);
    }

    this.logger.debug(`Fetched strategy - StrategyID: ${id}`);
    return strategy;
  }

  async createStrategy(dto: StrategyCreateRequestDto): Promise<Strategy> {
    this.logger.debug('Creating new strategy');
    const strategy = new Strategy({ ...dto, orders: [] });
    const savedStrategy = await this.strategyRepository.save(strategy);
    this.logger.log(`Created new strategy - StrategyID: ${savedStrategy.id} - Type: ${savedStrategy.type}`);
    return savedStrategy;
  }

  async updateStrategy(id: string, dto: StrategyUpdateRequestDto): Promise<Strategy> {
    this.logger.debug(`Updating strategy - StrategyID: ${id}`);
    const strategy = await this.getStrategyById(id);
    Object.assign(strategy, dto);
    const updatedStrategy = await this.strategyRepository.save(strategy);
    this.logger.log(`Updated strategy - StrategyID: ${id}`);
    return updatedStrategy;
  }

  async deleteStrategy(id: string): Promise<boolean> {
    this.logger.debug(`Deleting strategy - StrategyID: ${id}`);
    const strategy = await this.getStrategyById(id);
    await this.strategyRepository.remove(strategy);
    this.logger.log(`Deleted strategy - StrategyID: ${id}`);
    return true;
  }

  async processOrderExecutionData(executionData: IExecutionData) {
    this.logger.debug(`Processing order execution data - OrderID: ${executionData.orderId}`);
    const relevantStrategies = await this.strategyRepository.find({
      where: { orders: executionData.orderId }
    });
    this.logger.debug(
      `Found relevant strategies - Count: ${relevantStrategies.length} - OrderID: ${executionData.orderId}`
    );

    await Promise.all(
      relevantStrategies.map(async (strategy) => {
        try {
          const instance = this.strategyFactory.createStrategy(strategy.type);
          this.logger.debug(
            `Handling order execution - StrategyID: ${strategy.id} - OrderID: ${executionData.orderId}`
          );
          await instance.handleOrderExecution(strategy.accountId, strategy, executionData);
          this.logger.debug(`Handled order execution - StrategyID: ${strategy.id} - OrderID: ${executionData.orderId}`);

          await this.strategyRepository.save(strategy);
        } catch (error) {
          this.logger.error(
            `Order execution processing failed - StrategyID: ${strategy.id} - OrderID: ${executionData.orderId} - Error: ${error.message}`,
            error.stack
          );
        }
      })
    );
    this.logger.debug(`Completed processing order execution data - OrderID: ${executionData.orderId}`);
  }

  private async processStrategy(strategy: Strategy): Promise<void> {
    this.logger.debug(`Processing strategy - StrategyID: ${strategy.id}`);
    const instance = this.strategyFactory.createStrategy(strategy.type);

    try {
      await instance.process(strategy.accountId, strategy);
      this.logger.debug(`Processed strategy - StrategyID: ${strategy.id}`);
    } catch (error) {
      this.logger.error(
        `Strategy processing failed - StrategyID: ${strategy.id} - Error: ${error.message}`,
        error.stack
      );
    }
  }

  private async processStrategies() {
    this.logger.debug('Starting to process all strategies');
    const strategies = await this.getAllStrategies();
    this.logger.debug(`Processing strategies - Count: ${strategies.length}`);
    for (const strategy of strategies) {
      await this.processStrategy(strategy);
    }
    this.logger.debug('Completed processing all strategies');
  }
}
