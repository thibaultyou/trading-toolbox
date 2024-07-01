import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Events } from '../../config';
import { ExchangeFactory } from '../exchange/services/exchange-service.factory';
import { maskString } from './account.utils';
import { AccountCreateRequestDto } from './dtos/account-create.request.dto';
import { AccountUpdateRequestDto } from './dtos/account-update.request.dto';
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
    this.logger.debug('Fetching all accounts');
    const accounts = await this.accountRepository.find();
    this.logger.log(`Fetched accounts - Count: ${accounts.length}`);
    return accounts;
  }

  async getAccountById(id: string): Promise<Account> {
    this.logger.debug(`Fetching account - AccountID: ${id}`);
    const account = await this.accountRepository.findOne({ where: { id } });

    if (!account) {
      this.logger.warn(`Account not found - AccountID: ${id}`);
      throw new AccountNotFoundException(id);
    }

    this.logger.debug(`Fetched account - AccountID: ${id}`);
    return account;
  }

  async createAccount(dto: AccountCreateRequestDto): Promise<Account> {
    this.logger.debug(`Creating new account - Name: ${dto.name}`);
    const existingAccount = await this.accountRepository.findOne({
      where: [{ name: dto.name }, { key: dto.key }]
    });

    if (existingAccount) {
      if (existingAccount.name === dto.name) {
        this.logger.warn(`Account creation failed - Name: ${dto.name} - Reason: Account with this name already exists`);
      }

      if (existingAccount.key === dto.key) {
        this.logger.warn(
          `Account creation failed - Key: ${maskString(dto.key)} - Reason: Account with this key already exists`
        );
      }

      throw new AccountAlreadyExistsException(dto.name, dto.key);
    }

    const account = Account.fromDto(dto);

    try {
      this.logger.debug(`Creating exchange for account - Name: ${account.name}`);
      await this.exchangeFactory.createExchange(account);
      this.logger.debug(`Created exchange for account - Name: ${account.name}`);
    } catch (error) {
      this.logger.error(`Exchange creation failed - Account: ${account.name} - Error: ${error.message}`, error.stack);
      throw error;
    }

    const savedAccount = await this.accountRepository.save(account);
    this.eventEmitter.emit(Events.ACCOUNT_CREATED, new AccountCreatedEvent(savedAccount));
    this.logger.log(`Created new account - AccountID: ${savedAccount.id} - Name: ${savedAccount.name}`);
    return savedAccount;
  }

  async updateAccount(id: string, dto: AccountUpdateRequestDto): Promise<Account> {
    this.logger.debug(`Updating account - AccountID: ${id}`);
    const account = await this.getAccountById(id);

    if (!account) {
      this.logger.warn(`Account update failed - AccountID: ${id} - Reason: Account not found`);
      throw new AccountNotFoundException(id);
    }

    Object.assign(account, dto);

    const savedAccount = await this.accountRepository.save(account);
    this.eventEmitter.emit(Events.ACCOUNT_UPDATED, new AccountUpdatedEvent(savedAccount));
    this.logger.log(`Updated account - AccountID: ${savedAccount.id}`);
    return savedAccount;
  }

  async deleteAccount(id: string): Promise<boolean> {
    this.logger.debug(`Deleting account - AccountID: ${id}`);
    const account = await this.getAccountById(id);

    if (!account) {
      this.logger.warn(`Account deletion failed - AccountID: ${id} - Reason: Account not found`);
      throw new AccountNotFoundException(id);
    }

    await this.accountRepository.delete(id);
    this.eventEmitter.emit(Events.ACCOUNT_DELETED, new AccountDeletedEvent(account));
    this.logger.log(`Deleted account - AccountID: ${id}`);
    return true;
  }
}
