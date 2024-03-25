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
  AccountAlreadyExistsException,
  AccountNotFoundException,
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
    this.logger.log(`Accounts - Fetch Initiated`);
    const accounts = await this.accountRepository.find();

    return accounts;
  }

  async findOne(id: string): Promise<Account> {
    this.logger.log(`Account - Fetch Initiated - AccountID: ${id}`);
    const account = await this.accountRepository.findOne({ where: { id } });

    if (!account) {
      this.logger.error(
        `Account - Fetch Failed - AccountID: ${id}, Reason: Account not found`,
      );
      throw new AccountNotFoundException(id);
    }

    return account;
  }

  async findOneByName(name: string): Promise<Account> {
    this.logger.log(`Account - Fetch Initiated - Name: ${name}`);
    const account = await this.accountRepository.findOne({ where: { name } });

    if (!account) {
      this.logger.error(
        `Account - Fetch Failed - Name: ${name}, Reason: Account not found`,
      );
      throw new AccountNotFoundException(name, true);
    }

    return account;
  }

  async create(account: Account): Promise<Account> {
    this.logger.log(`Account - Create Initiated - Name: ${account.name}`);
    const existingAccount = await this.accountRepository.findOne({
      where: [{ name: account.name }, { key: account.key }],
    });

    if (existingAccount) {
      if (existingAccount.name === account.name) {
        this.logger.error(
          `Account - Create Failed - Name: ${account.name}, Reason: Account with this name already exists`,
        );
      }

      if (existingAccount.key === account.key) {
        this.logger.error(
          `Account - Create Failed - Key: ${maskString(account.key)}, Reason: Account with this key already exists`,
        );
      }

      throw new AccountAlreadyExistsException(account.name, account.key);
    }

    try {
      await this.exchangeFactory.createExchange(account);
    } catch (error) {
      this.logger.error(
        `Account - Create Failed - Account: ${account.name}, Error: ${error.message}`,
      );
      throw error;
    }

    const savedAccount = await this.accountRepository.save(account);

    this.eventEmitter.emit(
      Events.ACCOUNT_CREATED,
      new AccountCreatedEvent(savedAccount),
    );
    this.logger.log(
      `Account - Creation Success - AccountID: ${savedAccount.id}`,
    );

    return savedAccount;
  }

  async partialUpdate(
    id: string,
    updateFields: Partial<Account>,
  ): Promise<Account> {
    this.logger.log(`Account - Update Initiated - AccountID: ${id}`);
    const account = await this.findOne(id);

    if (!account) {
      this.logger.error(
        `Account - Update Failed - AccountID: ${id}, Reason: Account not found`,
      );
      throw new AccountNotFoundException(id);
    }

    Object.assign(account, updateFields);

    const savedAccount = await this.accountRepository.save(account);

    this.eventEmitter.emit(
      Events.ACCOUNT_UPDATED,
      new AccountUpdatedEvent(savedAccount),
    );
    this.logger.log(`Account - Update Success - AccountID: ${savedAccount.id}`);

    return savedAccount;
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log(`Account - Deletion Initiated - AccountID: ${id}`);
    const account = await this.findOne(id);

    if (!account) {
      this.logger.error(
        `Account - Deletion Failed - AccountID: ${id}, Reason: Account not found`,
      );
      throw new AccountNotFoundException(id);
    }

    await this.accountRepository.delete(id);
    this.eventEmitter.emit(
      Events.ACCOUNT_DELETED,
      new AccountDeletedEvent(account),
    );
    this.logger.log(`Account - Deleted Successfully - AccountID: ${id}`);

    return true;
  }
}
