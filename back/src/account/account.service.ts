import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Events } from '../config';

import { Account } from './entities/account.entity';
import { AccountCreatedEvent } from './events/account-created.event';
import { AccountDeletedEvent } from './events/account-deleted.event';
import { AccountUpdatedEvent } from './events/account-updated.event';
import {
  AccountNotFoundException,
  AccountAlreadyExistsException,
} from './exceptions/account.exceptions';
import { maskString } from '../utils/string.utils';

@Injectable()
export class AccountService {
  private logger = new Logger(AccountService.name);

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<Account[]> {
    this.logger.debug('Fetching all accounts');
    const accounts = await this.accountRepository.find();
    return accounts;
  }

  async findOne(id: string): Promise<Account> {
    this.logger.log(`Fetching account with id: ${id}`);
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new AccountNotFoundException(id);
    }
    return account;
  }

  async findOneByName(name: string): Promise<Account> {
    this.logger.log(`Fetching account with name: ${name}`);
    const account = await this.accountRepository.findOne({ where: { name } });
    if (!account) {
      throw new AccountNotFoundException(name, true);
    }
    return account;
  }

  async create(account: Account): Promise<Account> {
    this.logger.log(`Creating account with name: ${account.name}`);
    const existingAccount = await this.accountRepository.findOne({
      where: [{ name: account.name }, { key: account.key }],
    });
    if (existingAccount) {
      throw new AccountAlreadyExistsException(account.name, account.key);
    }
    const savedAccount = await this.accountRepository.save(account);
    this.eventEmitter.emit(
      Events.ACCOUNT_CREATED,
      new AccountCreatedEvent(savedAccount),
    );
    this.logger.log(`Account created with id: ${savedAccount.id}`);
    return savedAccount;
  }

  async update(id: string, updatedAccount: Account): Promise<Account> {
    this.logger.log(`Updating account with id: ${id}`);
    const account = await this.findOne(id);
    account.name = updatedAccount.name;
    account.key = updatedAccount.key;
    account.secret = updatedAccount.secret;
    const savedAccount = await this.accountRepository.save(account);
    this.eventEmitter.emit(
      Events.ACCOUNT_UPDATED,
      new AccountUpdatedEvent(savedAccount),
    );
    this.logger.log(`Account updated with id: ${savedAccount.id}`);
    return savedAccount;
  }

  async delete(id: string): Promise<void> {
    const account = await this.findOne(id);
    if (!account) {
      throw new AccountNotFoundException(id);
    }
    await this.accountRepository.delete(id);
    this.eventEmitter.emit(
      Events.ACCOUNT_DELETED,
      new AccountDeletedEvent(account),
    );
    this.logger.log(`Account deleted with id: ${id}`);
  }

  hideSensitiveData(account: Account): Account {
    account.key = maskString(account.key);
    account.secret = maskString(account.secret);
    return account;
  }
}
