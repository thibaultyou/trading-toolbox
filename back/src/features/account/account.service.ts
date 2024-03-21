import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Events } from '../../config';
import { maskString } from '../../utils/string.util';
import { ExchangeFactory } from '../exchange/services/exchange-service.factory';

import { Account } from './entities/account.entity';
import { AccountCreatedEvent } from './events/account-created.event';
import { AccountDeletedEvent } from './events/account-deleted.event';
import { AccountUpdatedEvent } from './events/account-updated.event';
import {
  AccountNotFoundException,
  AccountAlreadyExistsException,
} from './exceptions/account.exceptions';

@Injectable()
export class AccountService {
  private logger = new Logger(AccountService.name);

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private eventEmitter: EventEmitter2,
    private exchangeFactory: ExchangeFactory,
  ) {}

  async findAll(): Promise<Account[]> {
    this.logger.debug('Accounts fetch initiated');
    const accounts = await this.accountRepository.find();
    return accounts;
  }

  async findOne(id: string): Promise<Account> {
    this.logger.log(`Account fetch initiated - ID: ${id}`);
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      this.logger.error(`Account not found - ID: ${id}`);
      throw new AccountNotFoundException(id);
    }
    return account;
  }

  async findOneByName(name: string): Promise<Account> {
    this.logger.log(`Account fetch initiated - Account: ${name}`);
    const account = await this.accountRepository.findOne({ where: { name } });
    if (!account) {
      this.logger.error(`Account not found - Name: ${name}`);
      throw new AccountNotFoundException(name, true);
    }
    return account;
  }

  async create(account: Account): Promise<Account> {
    this.logger.log(`Account creation initiated - Name: ${account.name}`);
    const existingAccount = await this.accountRepository.findOne({
      where: [{ name: account.name }, { key: account.key }],
    });

    if (existingAccount) {
      if (existingAccount.name === account.name) {
        this.logger.error(
          `Account creation failed, already exists - Name: ${account.name}`,
        );
      }
      if (existingAccount.key === account.key) {
        this.logger.error(
          `Account creation failed, already exists - Key: ${maskString(account.key)}`,
        );
      }
      throw new AccountAlreadyExistsException(account.name, account.key);
    }

    try {
      await this.exchangeFactory.createExchange(account);
    } catch (error) {
      this.logger.error(
        `Account creation failed for initialization on exchange - Account: ${account.name}, Error: ${error.message}`,
      );
      throw error;
    }

    const savedAccount = await this.accountRepository.save(account);
    this.eventEmitter.emit(
      Events.ACCOUNT_CREATED,
      new AccountCreatedEvent(savedAccount),
    );
    this.logger.log(`Account created successfully - ID: ${savedAccount.id}`);
    return savedAccount;
  }

  async update(id: string, updatedAccount: Account): Promise<Account> {
    this.logger.log(`Account update initiated - ID: ${id}`);
    const account = await this.findOne(id);
    if (!account) {
      this.logger.error(`Account update failed, not found - ID: ${id}`);
      throw new AccountNotFoundException(id);
    }

    account.name = updatedAccount.name;
    account.key = updatedAccount.key;
    account.secret = updatedAccount.secret;
    const savedAccount = await this.accountRepository.save(account);
    this.eventEmitter.emit(
      Events.ACCOUNT_UPDATED,
      new AccountUpdatedEvent(savedAccount),
    );
    this.logger.log(`Account updated successfully - ID: ${savedAccount.id}`);
    return savedAccount;
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log(`Account deletion initiated - ID: ${id}`);
    const account = await this.findOne(id);
    if (!account) {
      this.logger.error(`Account deletion failed, not found - ID: ${id}`);
      throw new AccountNotFoundException(id);
    }
    await this.accountRepository.delete(id);
    this.eventEmitter.emit(
      Events.ACCOUNT_DELETED,
      new AccountDeletedEvent(account),
    );
    this.logger.log(`Account deleted successfully - ID: ${id}`);
    return true;
  }
}
