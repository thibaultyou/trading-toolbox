import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { StrategyCreateRequestDto } from './dtos/strategy-create.request.dto';
import { StrategyReadResponseDto } from './dtos/strategy-read.response.dto';
import { StrategyUpdateRequestDto } from './dtos/strategy-update.request.dto';
import { StrategyNotFoundException } from './exceptions/strategy.exceptions';
import { StrategyService } from './strategy.service';

@ApiTags('Strategies')
@Controller('strategies')
export class StrategyController extends BaseController {
  constructor(private readonly strategyService: StrategyService) {
    super('Strategies');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all strategies' })
  async getAllStrategies(): Promise<StrategyReadResponseDto[]> {
    const strategies = await this.strategyService.getAllStrategies();
    return strategies.map((strategy) => new StrategyReadResponseDto(strategy));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single strategy' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the strategy' })
  async getStrategyById(@Param('id') id: string): Promise<StrategyReadResponseDto> {
    const strategy = await this.strategyService.getStrategyById(id);

    if (!strategy) throw new StrategyNotFoundException(id);
    return new StrategyReadResponseDto(strategy);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new strategy' })
  @ApiBody({ description: 'Strategy creation details', type: StrategyCreateRequestDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createStrategy(@Body() strategyCreateRequestDto: StrategyCreateRequestDto): Promise<StrategyReadResponseDto> {
    return new StrategyReadResponseDto(await this.strategyService.createStrategy(strategyCreateRequestDto));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a strategy' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the strategy' })
  @ApiBody({ description: 'Strategy update details', type: StrategyUpdateRequestDto })
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateStrategy(
    @Param('id') id: string,
    @Body() strategyUpdateRequestDto: StrategyUpdateRequestDto
  ): Promise<StrategyReadResponseDto> {
    const strategy = await this.strategyService.updateStrategy(id, strategyUpdateRequestDto);

    if (!strategy) {
      throw new StrategyNotFoundException(id);
    }
    return new StrategyReadResponseDto(strategy);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a strategy' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the strategy' })
  async deleteStrategy(@Param('id') id: string): Promise<void> {
    const wasDeleted = await this.strategyService.deleteStrategy(id);

    if (!wasDeleted) {
      throw new StrategyNotFoundException(id);
    }
  }
}
