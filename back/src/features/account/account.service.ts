import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { maskString } from '../../common/utils/string.util';
import { Events } from '../../config';
import { ExchangeFactory } from '../exchange/services/exchange-service.factory';
import { AccountCreateRequestDto } from './dto/account-create.request.dto';
import { AccountUpdateRequestDto } from './dto/account-update.request.dto';
import { Account } from './entities/account.entity';
import { AccountCreatedEvent } from './events/account-created.event';
import { AccountDeletedEvent } from './events/account-deleted.event';
import { AccountUpdatedEvent } from './events/account-updated.event';
import { AccountAlreadyExistsException, AccountNotFoundException } from './exceptions/account.exceptions';

@Injectable()
export class AccountService {
  private logger = new Logger(AccountService.name);

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private eventEmitter: EventEmitter2,
    private exchangeFactory: ExchangeFactory
  ) {}

  async getAllAccounts(): Promise<Account[]> {
    this.logger.log(`Accounts - Fetch Initiated`);
    const accounts = await this.accountRepository.find();

    return accounts;
  }

  async getAccountById(id: string): Promise<Account> {
    this.logger.log(`Account - Fetch Initiated - AccountID: ${id}`);
    const account = await this.accountRepository.findOne({ where: { id } });

    if (!account) {
      this.logger.error(`Account - Fetch Failed - AccountID: ${id}, Reason: Account not found`);
      throw new AccountNotFoundException(id);
    }

    return account;
  }

  async createAccount(dto: AccountCreateRequestDto): Promise<Account> {
    this.logger.log(`Account - Create Initiated - Name: ${dto.name}`);
    const existingAccount = await this.accountRepository.findOne({
      where: [{ name: dto.name }, { key: dto.key }]
    });

    if (existingAccount) {
      if (existingAccount.name === dto.name) {
        this.logger.error(
          `Account - Creation Failed - Name: ${dto.name}, Reason: Account with this name already exists`
        );
      }

      if (existingAccount.key === dto.key) {
        this.logger.error(
          `Account - Creation Failed - Key: ${maskString(dto.key)}, Reason: Account with this key already exists`
        );
      }

      throw new AccountAlreadyExistsException(dto.name, dto.key);
    }

    const account = Account.fromDto(dto);

    try {
      await this.exchangeFactory.createExchange(account);
    } catch (error) {
      this.logger.error(`Account - Creation Failed - Account: ${account.name}, Error: ${error.message}`);
      throw error;
    }

    const savedAccount = await this.accountRepository.save(account);

    this.eventEmitter.emit(Events.ACCOUNT_CREATED, new AccountCreatedEvent(savedAccount));
    this.logger.log(`Account - Created - AccountID: ${savedAccount.id}`);

    return savedAccount;
  }

  async updateAccount(id: string, dto: AccountUpdateRequestDto): Promise<Account> {
    this.logger.log(`Account - Update Initiated - AccountID: ${id}`);
    const account = await this.getAccountById(id);

    if (!account) {
      this.logger.error(`Account - Update Failed - AccountID: ${id}, Reason: Account not found`);
      throw new AccountNotFoundException(id);
    }

    Object.assign(account, dto);

    const savedAccount = await this.accountRepository.save(account);

    this.eventEmitter.emit(Events.ACCOUNT_UPDATED, new AccountUpdatedEvent(savedAccount));
    this.logger.log(`Account - Updated - AccountID: ${savedAccount.id}`);

    return savedAccount;
  }

  async deleteAccount(id: string): Promise<boolean> {
    this.logger.log(`Account - Deletion Initiated - AccountID: ${id}`);
    const account = await this.getAccountById(id);

    if (!account) {
      this.logger.error(`Account - Deletion Failed - AccountID: ${id}, Reason: Account not found`);
      throw new AccountNotFoundException(id);
    }

    await this.accountRepository.delete(id);
    this.eventEmitter.emit(Events.ACCOUNT_DELETED, new AccountDeletedEvent(account));
    this.logger.log(`Account - Deleted - AccountID: ${id}`);

    return true;
  }
}
