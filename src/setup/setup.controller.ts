import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Setup } from './entities/setup';
import { CreateSetupDto } from './dto/create-setup.dto';
import { SetupService } from './setup.service';
import { UpdateSetupDto } from './dto/update-setup.dto';

@ApiTags('setups')
@Controller('setups')
export class SetupController {
    constructor(private readonly setupService: SetupService) { }

    @Get()
    @ApiOperation({ summary: 'Get all setups' })
    async findAll(): Promise<Setup[]> {
        return this.setupService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a setup by ID' })
    async findOne(@Param('id') id: string): Promise<Setup> {
        return this.setupService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new setup' })
    @ApiBody({ type: CreateSetupDto })
    async create(@Body() createSetupDto: CreateSetupDto): Promise<Setup> {
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
        return this.setupService.update(id, ticker);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a setup by ID' })
    async delete(@Param('id') id: string): Promise<void> {
        return this.setupService.delete(id);
    }
}
