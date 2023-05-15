import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { AccountCreatedEvent } from './events/account-created.event';
import { AccountUpdatedEvent } from './events/account-updated.event';
import { AccountDeletedEvent } from './events/account-deleted.event';
import { Events } from '../app.constants';

@Injectable()
export class AccountService {
  private logger = new Logger(AccountService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async findAll(): Promise<Account[]> {
    try {
      this.logger.log('Fetching all accounts');
      return await this.accountRepository.find();
    } catch (error) {
      this.logger.error('Error fetching all accounts', error.stack);
    }
  }

  async findOne(id: string): Promise<Account> {
    try {
      this.logger.log(`Fetching account with id: ${id}`);
      return await this.accountRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Error fetching account with id: ${id}`, error.stack);
    }
  }

  async create(account: Account): Promise<Account> {
    try {
      this.logger.log(`Creating account with name: ${name}`);
      const savedAccount = await this.accountRepository.save(account);
      this.eventEmitter.emit(
        Events.ACCOUNT_CREATED,
        new AccountCreatedEvent(savedAccount.id, savedAccount.name),
      );
      this.logger.log(`Account created with id: ${savedAccount.id}`);
      return savedAccount;
    } catch (error) {
      this.logger.error(
        `Error creating account with name: ${name}`,
        error.stack,
      );
    }
  }

  async update(id: string, updatedAccount: Account): Promise<Account> {
    try {
      this.logger.log(`Updating account with id: ${id}`);
      const account = await this.findOne(id);
      account.name = updatedAccount.name;
      account.key = updatedAccount.key;
      account.secret = updatedAccount.secret;
      const savedAccount = await this.accountRepository.save(account);
      this.eventEmitter.emit(
        Events.ACCOUNT_UPDATED,
        new AccountUpdatedEvent(savedAccount.id, savedAccount.name),
      );
      this.logger.log(`Account updated with id: ${id}`);
      return savedAccount;
    } catch (error) {
      this.logger.error(`Error updating account with id: ${id}`, error.stack);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.accountRepository.delete(id);
      this.eventEmitter.emit(
        Events.ACCOUNT_DELETED,
        new AccountDeletedEvent(id),
      );
      this.logger.log(`Account deleted with id: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting account with id: ${id}`, error.stack);
    }
  }
}
