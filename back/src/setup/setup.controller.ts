import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../common/base.controller';

import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
import { Setup } from './entities/setup.entity';
import { SetupService } from './setup.service';

@Controller('setups')
@ApiTags('setups')
export class SetupController extends BaseController {
  constructor(private readonly setupService: SetupService) {
    super('SetupController');
  }

  @Get()
  @ApiOperation({ summary: 'Get all setups' })
  async findAll(): Promise<Setup[]> {
    return await this.setupService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a setup by ID' })
  async findOne(@Param('id') id: string): Promise<Setup> {
    return await this.setupService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new setup' })
  @ApiBody({ type: CreateSetupDto })
  async create(@Body() createSetupDto: CreateSetupDto): Promise<Setup> {
    const newSetup = await Setup.fromDto(createSetupDto);
    return await this.setupService.create(newSetup);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a setup' })
  @ApiBody({ type: UpdateSetupDto })
  async update(
    @Param('id') id: string,
    @Body() updateSetupDto: UpdateSetupDto,
  ): Promise<Setup> {
    const updatedSetup = await Setup.fromDto(updateSetupDto);
    return await this.setupService.update(id, updatedSetup);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a setup by ID' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.setupService.delete(id);
  }
}
