import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { SetupReadResponseDto } from './dtos/_setup-read.response.dto';
import { SetupService } from './setup.service';

// import { SetupUpdateRequestDto } from './dto/setup-update.request.dto';
// import { SetupReadResponseDto } from './dto/setup-read.response.dto';
@ApiTags('Setups')
@Controller('setups')
export class SetupController extends BaseController {
  constructor(private readonly setupService: SetupService) {
    super('Setups');
  }

  @Get('/accounts/:accountId/setups')
  @ApiOperation({ summary: 'Fetch all setups for an account' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  async getAccountSetups(@Param('accountId') accountId: string): Promise<SetupReadResponseDto[]> {
    return (await this.setupService.getSetupsForAccount(accountId)).map((setup) => new SetupReadResponseDto(setup));
  }

  // @Post('/accounts/:accountId/setups')
  // @ApiOperation({ summary: 'Create a setup for an account' })
  // @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  // @ApiBody({
  //     description: 'Setup creation details',
  //     type: SetupCreateRequestDto
  // })
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async createSetup(
  //     @Param('accountId') accountId: string,
  //     @Body() createSetupRequestDto: SetupCreateRequestDto
  // ): Promise<SetupReadResponseDto> {
  //     const setup = await this.setupService.createSetup(accountId, createSetupRequestDto);
  //     return new SetupReadResponseDto(setup);
  // }

  // @Get('/accounts/:accountId/setups/:setupId')
  // @ApiOperation({ summary: 'Fetch a setup by ID' })
  // @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  // @ApiParam({ name: 'setupId', required: true, description: 'The ID of the setup to retrieve' })
  // async getSetupById(
  //     @Param('accountId') accountId: string,
  //     @Param('setupId') setupId: string
  // ): Promise<SetupReadResponseDto> {
  //     return new SetupReadResponseDto(await this.setupService.getSetupById(accountId, setupId));
  // }

  // @Patch('/accounts/:accountId/setups/:setupId')
  // @ApiOperation({ summary: 'Update a setup' })
  // @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  // @ApiParam({ name: 'setupId', required: true, description: 'The ID of the setup to update' })
  // @ApiBody({
  //     description: 'Setup update details',
  //     type: SetupUpdateRequestDto
  // })
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async updateSetup(
  //     @Param('accountId') accountId: string,
  //     @Param('setupId') setupId: string,
  //     @Body() updateSetupDto: SetupUpdateRequestDto
  // ): Promise<SetupReadResponseDto> {
  //     const setup = await this.setupService.updateSetup(accountId, setupId, updateSetupDto);
  //     return new SetupReadResponseDto(setup);
  // }

  // @Delete('/accounts/:accountId/setups/:setupId')
  // @ApiOperation({ summary: 'Delete a setup' })
  // @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account for which the setup will be deleted' })
  // @ApiParam({ name: 'setupId', required: true, description: 'The ID of the setup to delete' })
  // async deleteSetup(
  //     @Param('accountId') accountId: string,
  //     @Param('setupId') setupId: string
  // ) {
  //     await this.setupService.deleteSetup(accountId, setupId);
  // }
}
