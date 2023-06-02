import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';
import { ActionService } from './action.service';
import { Action } from './entities/action.entity';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { SetupService } from '../setup/setup.service';

@ApiTags('actions')
@Controller('actions')
export class ActionController {
  constructor(
    private readonly actionService: ActionService,
    private readonly setupService: SetupService,
  ) { }

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

  @Post(':setupId')
  @ApiOperation({ summary: 'Create a new action' })
  @ApiBody({ type: CreateActionDto })
  async create(
    @Param('setupId') setupId: string,
    @Body() createActionDto: CreateActionDto,
  ): Promise<Action> {
    const setup = await this.setupService.findOne(setupId);

    if (!setup) {
      throw new NotFoundException(`Setup with ID ${setupId} not found`);
    }

    const action = await this.actionService.create(createActionDto);
    if (!setup.actions) {
      setup.actions = [];
    }
    setup.actions.push(action);
    await this.setupService.update(setupId, setup);
    return action;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an action' })
  @ApiBody({ type: UpdateActionDto })
  async update(
    @Param('id') id: string,
    @Body() actionUpdateDto: UpdateActionDto,
  ): Promise<Action> {
    return this.actionService.update(id, actionUpdateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an action by ID' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.actionService.delete(id);
  }
}
