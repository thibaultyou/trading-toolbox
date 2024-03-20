import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';

import { AccountService } from './account.service';
import { AccountCreateRequestDto } from './dto/account-create.request.dto';
import { AccountUpdateRequestDto } from './dto/account-update.request.dto';
import { AccountResponseDto } from './dto/account.response.dto';
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
  async findAll(): Promise<AccountResponseDto[]> {
    const accounts = await this.accountService.findAll();
    return accounts.map((account) => new AccountResponseDto(account));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch an account by ID' })
  async findOne(@Param('id') id: string): Promise<AccountResponseDto> {
    const account = await this.accountService.findOne(id);
    if (!account) {
      throw new AccountNotFoundException(id);
    }
    return new AccountResponseDto(account);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({ type: AccountCreateRequestDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() accountCreateRequestDto: AccountCreateRequestDto,
  ): Promise<AccountResponseDto> {
    const account = await this.accountService.create(
      Account.fromDto(accountCreateRequestDto),
    );
    return new AccountResponseDto(account);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiBody({ type: AccountUpdateRequestDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() accountUpdateRequestDto: AccountUpdateRequestDto,
  ): Promise<AccountResponseDto> {
    const account = await this.accountService.update(
      id,
      Account.fromDto(accountUpdateRequestDto),
    );
    if (!account) {
      throw new AccountNotFoundException(id);
    }
    return new AccountResponseDto(account);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account by ID' })
  async delete(@Param('id') id: string): Promise<void> {
    const wasDeleted = await this.accountService.delete(id);
    if (!wasDeleted) {
      throw new AccountNotFoundException(id);
    }
  }
}
