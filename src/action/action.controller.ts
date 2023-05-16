import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { ActionService } from './action.service';
import { Action } from './entities/action.entity';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';

@Controller('actions')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all actions' })
  async findAll(): Promise<Action[]> {
    return this.actionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an action by ID' })
  async findOne(@Param('id') id: string): Promise<Action> {
    return this.actionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new action' })
  @ApiBody({ type: CreateActionDto })
  async create(@Body() createActionDto: CreateActionDto): Promise<Action> {
    return this.actionService.create(createActionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an action' })
  @ApiBody({ type: UpdateActionDto })
  async update(
    @Param('id') id: string,
    @Body() actionUpdateDto: UpdateActionDto,
  ): Promise<Action> {
    return this.actionService.updateAction(id, actionUpdateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an action by ID' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.actionService.delete(id);
  }
}
