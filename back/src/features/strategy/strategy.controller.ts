import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { API_BEARER_AUTH_NAME } from '../auth/auth.constants';
import { UserId } from '../auth/decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StrategyCreateRequestDto } from './dtos/strategy-create.request.dto';
import { StrategyReadResponseDto } from './dtos/strategy-read.response.dto';
import { StrategyUpdateRequestDto } from './dtos/strategy-update.request.dto';
import { StrategyNotFoundException } from './exceptions/strategy.exceptions';
import { StrategyService } from './strategy.service';

@ApiTags('Strategies')
@ApiBearerAuth(API_BEARER_AUTH_NAME)
@Controller('strategies')
@UseGuards(JwtAuthGuard)
export class StrategyController extends BaseController {
  constructor(private readonly strategyService: StrategyService) {
    super('Strategies');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all strategies' })
  async getAllStrategies(@UserId() userId: string): Promise<StrategyReadResponseDto[]> {
    const strategies = await this.strategyService.getAllStrategies(userId);
    return strategies.map((strategy) => new StrategyReadResponseDto(strategy));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single strategy' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the strategy' })
  async getStrategyById(@UserId() userId: string, @Param('id') id: string): Promise<StrategyReadResponseDto> {
    const strategy = await this.strategyService.getStrategyById(userId, id);

    if (!strategy) throw new StrategyNotFoundException(id);
    return new StrategyReadResponseDto(strategy);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new strategy' })
  @ApiBody({ description: 'Strategy creation details', type: StrategyCreateRequestDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createStrategy(
    @UserId() userId: string,
    @Body() strategyCreateRequestDto: StrategyCreateRequestDto
  ): Promise<StrategyReadResponseDto> {
    return new StrategyReadResponseDto(await this.strategyService.createStrategy(userId, strategyCreateRequestDto));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a strategy' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the strategy' })
  @ApiBody({ description: 'Strategy update details', type: StrategyUpdateRequestDto })
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateStrategy(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() strategyUpdateRequestDto: StrategyUpdateRequestDto
  ): Promise<StrategyReadResponseDto> {
    const strategy = await this.strategyService.updateStrategy(userId, id, strategyUpdateRequestDto);

    if (!strategy) {
      throw new StrategyNotFoundException(id);
    }
    return new StrategyReadResponseDto(strategy);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a strategy' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the strategy' })
  async deleteStrategy(@UserId() userId: string, @Param('id') id: string) {
    const wasDeleted = await this.strategyService.deleteStrategy(userId, id);

    if (!wasDeleted) {
      throw new StrategyNotFoundException(id);
    }
  }
}
