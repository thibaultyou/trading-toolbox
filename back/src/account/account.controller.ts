import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../common/base.controller';

import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { ExchangeService } from '../exchange/exchange.service';
import { MarketListResponse } from './account.types';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController extends BaseController {
  constructor(
    private readonly accountService: AccountService,
    private readonly exchangeService: ExchangeService,
  ) {
    super('Accounts');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all accounts' })
  async findAll(): Promise<Account[]> {
    const accounts = await this.accountService.findAll();
    return accounts.map((account) =>
      this.accountService.hideSensitiveData(account),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch an account by ID' })
  async findOne(@Param('id') id: string): Promise<Account> {
    const account = await this.accountService.findOne(id);
    return this.accountService.hideSensitiveData(account);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({ type: CreateAccountDto })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    const newAccount = Account.fromDto(createAccountDto);
    const account = await this.accountService.create(newAccount);
    return this.accountService.hideSensitiveData(account);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiBody({ type: UpdateAccountDto })
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const updatedAccount = Account.fromDto(updateAccountDto);
    const account = await this.accountService.update(id, updatedAccount);
    return this.accountService.hideSensitiveData(account);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account by ID' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.accountService.delete(id);
  }

  @Get('/:accountName/available-markets')
  @ApiOperation({ summary: 'List all available markets per account' })
  async listAvailableMarkets(
    @Param('accountName') accountName: string,
  ): Promise<MarketListResponse> {
    try {
      const account = await this.accountService.findOneByName(accountName);
      if (!account) {
        throw new Error(`Account with name ${accountName} not found.`);
      }
      const markets = await this.exchangeService.getMarkets(account.name);
      return {
        accountName: account.name,
        markets,
      };
    } catch (error) {
      throw new Error(
        `Error fetching available markets for account ${accountName}: ${error}`,
      );
    }
  }
}
