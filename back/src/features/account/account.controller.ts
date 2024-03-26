import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { AccountService } from './account.service';
import { AccountResponseDto } from './dto/account.response.dto';
import { AccountCreateRequestDto } from './dto/account-create.request.dto';
import { AccountUpdateRequestDto } from './dto/account-update.request.dto';
import { Account } from './entities/account.entity';
import { AccountNotFoundException } from './exceptions/account.exceptions';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController extends BaseController {
  constructor(private readonly accountService: AccountService) {
    super('Accounts');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all accounts' })
  async getAllAccounts(): Promise<AccountResponseDto[]> {
    const accounts = await this.accountService.getAllAccounts();

    return accounts.map((account) => new AccountResponseDto(account));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch an account by ID' })
  async getAccountById(@Param('id') id: string): Promise<AccountResponseDto> {
    const account = await this.accountService.getAccountById(id);

    if (!account) {
      throw new AccountNotFoundException(id);
    }

    return new AccountResponseDto(account);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({ type: AccountCreateRequestDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAccount(@Body() accountCreateRequestDto: AccountCreateRequestDto): Promise<AccountResponseDto> {
    const account = await this.accountService.createAccount(Account.fromDto(accountCreateRequestDto));

    return new AccountResponseDto(account);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiBody({ type: AccountUpdateRequestDto })
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateAccount(
    @Param('id') id: string,
    @Body() accountUpdateRequestDto: AccountUpdateRequestDto
  ): Promise<AccountResponseDto> {
    const account = await this.accountService.updateAccount(id, Account.fromDto(accountUpdateRequestDto));

    if (!account) {
      throw new AccountNotFoundException(id);
    }

    return new AccountResponseDto(account);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account by ID' })
  async deleteAccount(@Param('id') id: string): Promise<void> {
    const wasDeleted = await this.accountService.deleteAccount(id);

    if (!wasDeleted) {
      throw new AccountNotFoundException(id);
    }
  }
}
