import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { API_BEARER_AUTH_NAME } from '@auth/auth.constants';
import { UserId } from '@auth/decorators/user-id.decorator';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { BaseController } from '@common/base/base.controller';
import { RequestWithUser } from '@common/types/request-with-user.interface';

import { AccountService } from './account.service';
import { AccountCreateRequestDto } from './dtos/account-create.request.dto';
import { AccountDeleteResponseDto } from './dtos/account-delete.response.dto';
import { AccountReadResponseDto } from './dtos/account-read.response.dto';
import { AccountUpdateRequestDto } from './dtos/account-update.request.dto';

@ApiTags('Accounts')
@ApiBearerAuth(API_BEARER_AUTH_NAME)
@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController extends BaseController {
  constructor(private readonly accountService: AccountService) {
    super('Accounts');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all accounts' })
  @ApiResponse({ status: 200, description: 'List of accounts', type: [AccountReadResponseDto] })
  async getAllAccounts(@UserId() userId: string): Promise<AccountReadResponseDto[]> {
    const accounts = await this.accountService.getUserAccounts(userId);
    return accounts.map((account) => new AccountReadResponseDto(account));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single account' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the account' })
  @ApiResponse({ status: 200, description: 'The account', type: AccountReadResponseDto })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccountById(@UserId() userId: string, @Param('id') id: string): Promise<AccountReadResponseDto> {
    const account = await this.accountService.getAccountById(userId, id);
    return new AccountReadResponseDto(account);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({
    description: 'Account creation details',
    type: AccountCreateRequestDto,
    examples: {
      aBybitAccount: {
        summary: 'Bybit Account',
        value: {
          name: 'TEST',
          exchange: 'bybit',
          key: 'API_KEY',
          secret: 'API_SECRET'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'The created account', type: AccountReadResponseDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAccount(
    @Request() req: RequestWithUser,
    @Body() accountCreateRequestDto: AccountCreateRequestDto
  ): Promise<AccountReadResponseDto> {
    return new AccountReadResponseDto(await this.accountService.createAccount(req.user, accountCreateRequestDto));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the account' })
  @ApiBody({ type: AccountUpdateRequestDto })
  @ApiResponse({ status: 200, description: 'The updated account', type: AccountReadResponseDto })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateAccount(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() accountUpdateRequestDto: AccountUpdateRequestDto
  ): Promise<AccountReadResponseDto> {
    const account = await this.accountService.updateAccount(userId, id, accountUpdateRequestDto);
    return new AccountReadResponseDto(account);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the account' })
  @ApiResponse({ status: 200, description: 'The deleted account ID', type: AccountDeleteResponseDto })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async deleteAccount(@UserId() userId: string, @Param('id') id: string): Promise<AccountDeleteResponseDto> {
    const account = await this.accountService.deleteAccount(userId, id);
    return new AccountDeleteResponseDto(account);
  }
}
