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
import { AccountService } from './account.service';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AppLogger } from '../logger.service';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  private logger = new AppLogger(AccountController.name);

  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  async findAll(): Promise<Account[]> {
    this.logger.log('Fetching all accounts');
    return this.accountService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by ID' })
  async findOne(@Param('id') id: string): Promise<Account> {
    this.logger.log(`Fetching account with id: ${id}`);
    return this.accountService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({ type: CreateAccountDto })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    this.logger.log(`Creating account with name: ${createAccountDto.name}`);
    const account = await this.accountService.create(
      createAccountDto.name,
      createAccountDto.key,
      createAccountDto.secret,
    );
    this.logger.log(`Account created with id: ${account.id}`);
    return account;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiBody({ type: UpdateAccountDto })
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    this.logger.log(`Updating account with id: ${id}`);
    const account = await this.accountService.update(
      id,
      updateAccountDto.name,
      updateAccountDto.key,
      updateAccountDto.secret,
    );
    this.logger.log(`Account updated with id: ${account.id}`);
    return account;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account by ID' })
  async delete(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting account with id: ${id}`);
    return this.accountService.delete(id);
  }
}
