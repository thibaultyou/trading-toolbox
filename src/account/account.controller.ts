import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  private logger = new Logger(AccountController.name);

  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  async findAll(): Promise<Account[]> {
    try {
      this.logger.log('Fetching all accounts');
      return await this.accountService.findAll();
    } catch (error) {
      this.logger.error('Error fetching all accounts', error.stack);
      throw new HttpException(
        'Error fetching all accounts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by ID' })
  async findOne(@Param('id') id: string): Promise<Account> {
    try {
      this.logger.log(`Fetching account with id: ${id}`);
      return await this.accountService.findOne(id);
    } catch (error) {
      this.logger.error(`Error fetching account with id: ${id}`, error.stack);
      throw new HttpException(
        `Error fetching account with id: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({ type: CreateAccountDto })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    try {
      this.logger.log(`Creating account with name: ${createAccountDto.name}`);
      const newAccount = Account.fromDto(createAccountDto);
      const account = await this.accountService.create(newAccount);
      this.logger.log(`Account created with id: ${account.id}`);
      return account;
    } catch (error) {
      this.logger.error(
        `Error creating account with name: ${createAccountDto.name}`,
        error.stack,
      );
      throw new HttpException(
        `Error creating account with name: ${createAccountDto.name}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiBody({ type: UpdateAccountDto })
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    try {
      this.logger.log(`Updating account with id: ${id}`);
      const updatedAccount = Account.fromDto(updateAccountDto);
      const account = await this.accountService.update(id, updatedAccount);
      this.logger.log(`Account updated with id: ${account.id}`);
      return account;
    } catch (error) {
      this.logger.error(`Error updating account with id: ${id}`, error.stack);
      throw new HttpException(
        `Error updating account with id: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account by ID' })
  async delete(@Param('id') id: string): Promise<void> {
    try {
      this.logger.log(`Deleting account with id: ${id}`);
      await this.accountService.delete(id);
    } catch (error) {
      this.logger.error(`Error deleting account with id: ${id}`, error.stack);
      throw new HttpException(
        `Error deleting account with id: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
