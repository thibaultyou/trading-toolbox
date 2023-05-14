import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Setup } from './entities/setup.entity';
import { CreateSetupDto } from './dto/create-setup.dto';
import { SetupService } from './setup.service';
import { UpdateSetupDto } from './dto/update-setup.dto';
import { AppLogger } from '../logger.service';

@ApiTags('setups')
@Controller('setups')
export class SetupController {
  private readonly logger = new AppLogger(SetupController.name);

  constructor(private readonly setupService: SetupService) {}

  @Get()
  @ApiOperation({ summary: 'Get all setups' })
  async findAll(): Promise<Setup[]> {
    this.logger.log('Fetching all setups');
    return this.setupService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a setup by ID' })
  async findOne(@Param('id') id: string): Promise<Setup> {
    this.logger.log(`Fetching setup with id: ${id}`);
    return this.setupService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new setup' })
  @ApiBody({ type: CreateSetupDto })
  async create(@Body() createSetupDto: CreateSetupDto): Promise<Setup> {
    this.logger.log(`Creating setup with ticker: ${createSetupDto.ticker}`);
    return this.setupService.create(createSetupDto.ticker);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a setup' })
  @ApiBody({ type: UpdateSetupDto })
  async update(
    @Param('id') id: string,
    @Body() updateSetupDto: UpdateSetupDto,
  ): Promise<Setup> {
    const { ticker } = updateSetupDto;
    this.logger.log(`Updating setup with id: ${id} and ticker: ${ticker}`);
    return this.setupService.update(id, ticker);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a setup by ID' })
  async delete(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting setup with id: ${id}`);
    return this.setupService.delete(id);
  }
}
