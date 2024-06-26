// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Post,
//   Put,
// } from '@nestjs/common';
// import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// import { SetupNotFoundException } from '../_setup/exceptions/setup.exceptions';
// import { SetupService } from '../_setup/setup.service';
// import { BaseController } from '../common/base/base.controller';
// import { ActionService } from './action.service';
// import { CreateActionDto } from './dto/create-action.dto';
// import { UpdateActionDto } from './dto/update-action.dto';
// import { Action } from './entities/action.entity';

// @ApiTags('actions')
// @Controller('actions')
// export class ActionController extends BaseController {
//   constructor(
//     private readonly actionService: ActionService,
//     private readonly setupService: SetupService,
//   ) {
//     super('ActionController');
//   }

//   @Get()
//   @ApiOperation({ summary: 'Get all actions' })
//   async findAll(): Promise<Action[]> {
//     return await this.actionService.findAll();
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Get an action by ID' })
//   async findOne(@Param('id') id: string): Promise<Action> {
//     return await this.actionService.findOne(id);
//   }

//   @Post(':setupId')
//   @ApiOperation({ summary: 'Create a new action' })
//   @ApiBody({ type: CreateActionDto })
//   async create(
//     @Param('setupId') setupId: string,
//     @Body() createActionDto: CreateActionDto,
//   ): Promise<Action> {
//     const setup = await this.setupService.findOne(setupId);

//     if (!setup) {
//       throw new SetupNotFoundException(setupId);
//     }

//     const action = await this.actionService.create(createActionDto);

//     await this.setupService.update(setupId, {
//       ...setup,
//       actions: [...setup.actions, action],
//     });

//     return action;
//   }

//   @Put(':id')
//   @ApiOperation({ summary: 'Update an action' })
//   @ApiBody({ type: UpdateActionDto })
//   async update(
//     @Param('id') id: string,
//     @Body() actionUpdateDto: UpdateActionDto,
//   ): Promise<Action> {
//     return await this.actionService.update(id, actionUpdateDto);
//   }

//   @Delete(':id')
//   @ApiOperation({ summary: 'Delete an action by ID' })
//   async delete(@Param('id') id: string): Promise<void> {
//     await this.actionService.delete(id);
//   }
// }
