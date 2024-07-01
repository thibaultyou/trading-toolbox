import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { AccountService } from './account.service';
import { AccountCreateRequestDto } from './dtos/account-create.request.dto';
import { AccountReadResponseDto } from './dtos/account-read.response.dto';
import { AccountUpdateRequestDto } from './dtos/account-update.request.dto';
import { AccountNotFoundException } from './exceptions/account.exceptions';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController extends BaseController {
  constructor(private readonly accountService: AccountService) {
    super('Accounts');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all accounts' })
  async getAllAccounts(): Promise<AccountReadResponseDto[]> {
    const accounts = await this.accountService.getAllAccounts();
    return accounts.map((account) => new AccountReadResponseDto(account));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a single account' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the account' })
  async getAccountById(@Param('id') id: string): Promise<AccountReadResponseDto> {
    const account = await this.accountService.getAccountById(id);

    if (!account) throw new AccountNotFoundException(id);
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAccount(@Body() accountCreateRequestDto: AccountCreateRequestDto): Promise<AccountReadResponseDto> {
    return new AccountReadResponseDto(await this.accountService.createAccount(accountCreateRequestDto));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the account' })
  @ApiBody({ description: 'Account update details', type: AccountUpdateRequestDto })
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateAccount(
    @Param('id') id: string,
    @Body() accountUpdateRequestDto: AccountUpdateRequestDto
  ): Promise<AccountReadResponseDto> {
    const account = await this.accountService.updateAccount(id, accountUpdateRequestDto);

    if (!account) {
      throw new AccountNotFoundException(id);
    }
    return new AccountReadResponseDto(account);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiParam({ name: 'id', required: true, description: 'The ID of the account' })
  async deleteAccount(@Param('id') id: string): Promise<void> {
    const wasDeleted = await this.accountService.deleteAccount(id);

    if (!wasDeleted) {
      throw new AccountNotFoundException(id);
    }
  }
}
