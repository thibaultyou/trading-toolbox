import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { AccountCreatedEvent } from './events/account-created.event';
import { AccountUpdatedEvent } from './events/account-updated.event';
import { AccountDeletedEvent } from './events/account-deleted.event';
import { AppLogger } from '../logger.service';

@Injectable()
export class AccountService {
  private logger = new AppLogger(AccountService.name);

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

  async create(name: string, key: string, secret: string): Promise<Account> {
    try {
      this.logger.log(`Creating account with name: ${name}`);
      const account = new Account(name, key, secret);
      const savedAccount = await this.accountRepository.save(account);
      this.eventEmitter.emit(
        'account.created',
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

  async update(
    id: string,
    name: string,
    key: string,
    secret: string,
  ): Promise<Account> {
    try {
      this.logger.log(`Updating account with id: ${id}`);
      const account = await this.findOne(id);
      account.name = name;
      account.key = key;
      account.secret = secret;
      const updatedAccount = await this.accountRepository.save(account);
      this.eventEmitter.emit(
        'account.updated',
        new AccountUpdatedEvent(updatedAccount.id, updatedAccount.name),
      );
      this.logger.log(`Account updated with id: ${id}`);
      return updatedAccount;
    } catch (error) {
      this.logger.error(`Error updating account with id: ${id}`, error.stack);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.accountRepository.delete(id);
      this.eventEmitter.emit('account.deleted', new AccountDeletedEvent(id));
      this.logger.log(`Account deleted with id: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting account with id: ${id}`, error.stack);
    }
  }
}
