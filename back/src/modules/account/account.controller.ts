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

import { BaseController } from '@common/base.controller';
import { UuidValidationPipe } from '@common/pipes/uuid-validation.pipe';
import { RequestWithUser } from '@common/types/request-with-user.interface';
import { ExtractUserId } from '@user/decorators/user-id-extractor.decorator';
import { JwtAuthGuard } from '@user/guards/jwt-auth.guard';

import { AccountService } from './account.service';
import { AccountCreateRequestDto } from './dtos/account-create.request.dto';
import { AccountDeleteResponseDto } from './dtos/account-delete.response.dto';
import { AccountUpdateRequestDto } from './dtos/account-update.request.dto';
import { AccountDto } from './dtos/account.dto';
import { AccountMapperService } from './services/account-mapper.service';

@ApiTags('Accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('accounts')
@UsePipes(new ValidationPipe({ transform: true }))
export class AccountController extends BaseController {
  constructor(
    private readonly accountService: AccountService,
    private readonly accountMapper: AccountMapperService
  ) {
    super('Accounts');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all accounts' })
  @ApiResponse({ status: 200, description: 'List of accounts', type: [AccountDto] })
  async getAllAccounts(@ExtractUserId() userId: string): Promise<AccountDto[]> {
    const accounts = await this.accountService.getUserAccounts(userId);
    return accounts.map((account) => this.accountMapper.toDto(account));
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Fetch a single account' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account (UUID format)' })
  @ApiResponse({ status: 200, description: 'The account', type: AccountDto })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccountById(
    @ExtractUserId() userId: string,
    @Param('accountId', UuidValidationPipe) accountId: string
  ): Promise<AccountDto> {
    const account = await this.accountService.getAccountById(userId, accountId);
    return this.accountMapper.toDto(account);
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
  @ApiResponse({ status: 201, description: 'The created account', type: AccountDto })
  async createAccount(
    @Request() req: RequestWithUser,
    @Body() accountCreateRequestDto: AccountCreateRequestDto
  ): Promise<AccountDto> {
    const account = await this.accountService.createAccount(req.user, accountCreateRequestDto);
    return this.accountMapper.toDto(account);
  }

  @Patch(':accountId')
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account (UUID format)' })
  @ApiBody({ type: AccountUpdateRequestDto })
  @ApiResponse({ status: 200, description: 'The updated account', type: AccountDto })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async updateAccount(
    @ExtractUserId() userId: string,
    @Param('accountId', UuidValidationPipe) accountId: string,
    @Body() accountUpdateRequestDto: AccountUpdateRequestDto
  ): Promise<AccountDto> {
    const account = await this.accountService.updateAccount(userId, accountId, accountUpdateRequestDto);
    return this.accountMapper.toDto(account);
  }

  @Delete(':accountId')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account (UUID format)' })
  @ApiResponse({ status: 200, description: 'The deleted account ID', type: AccountDeleteResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async deleteAccount(
    @ExtractUserId() userId: string,
    @Param('accountId', UuidValidationPipe) accountId: string
  ): Promise<AccountDeleteResponseDto> {
    const account = await this.accountService.deleteAccount(userId, accountId);
    return new AccountDeleteResponseDto(account);
  }
}
