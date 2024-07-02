import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Events } from '../../config';
import { UserId } from '../auth/decorators/user-id.decorator';
import { User } from '../auth/entities/user.entity';
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

  async getUserAccounts(@UserId() userId: string): Promise<Account[]> {
    this.logger.debug(`Fetching all accounts - UserID: ${userId}`);
    const accounts = await this.accountRepository.find({ where: { user: { id: userId } } });
    this.logger.log(`Fetched accounts - Count: ${accounts.length}`);
    return accounts;
  }

  async getAllAccountsForSystem(): Promise<Account[]> {
    this.logger.debug('Fetching all accounts across all users');
    const accounts = await this.accountRepository.find();
    this.logger.log(`Fetched all accounts - Count: ${accounts.length}`);
    return accounts;
  }

  async getAccountById(@UserId() userId: string, id: string): Promise<Account> {
    this.logger.debug(`Fetching account - AccountID: ${id}`);
    const account = await this.accountRepository.findOne({ where: { id, user: { id: userId } } });

    if (!account) {
      this.logger.warn(`Account not found - AccountID: ${id}`);
      throw new AccountNotFoundException(id);
    }

    this.logger.debug(`Fetched account - AccountID: ${id}`);
    return account;
  }

  async validateUserAccount(@UserId() userId: string, accountId: string): Promise<Account> {
    this.logger.debug(`Validating user account - UserID: ${userId} - AccountID: ${accountId}`);
    const account = await this.getAccountById(userId, accountId);

    if (!account) {
      this.logger.warn(`User does not have access to this account - UserID: ${userId} - AccountID: ${accountId}`);
      throw new UnauthorizedException('You do not have access to this account');
    }

    this.logger.debug(`User account validated - UserID: ${userId} - AccountID: ${accountId}`);
    return account;
  }

  async getAccountByIdForSystem(id: string): Promise<Account> {
    this.logger.debug(`Fetching account for system - AccountID: ${id}`);
    const account = await this.accountRepository.findOne({ where: { id } });

    if (!account) {
      this.logger.warn(`Account not found - AccountID: ${id}`);
      throw new AccountNotFoundException(id);
    }

    this.logger.debug(`Fetched account - AccountID: ${id}`);
    return account;
  }

  async createAccount(user: User, dto: AccountCreateRequestDto): Promise<Account> {
    this.logger.debug(`Creating new account - Name: ${dto.name}`);
    const existingAccount = await this.accountRepository.findOne({
      where: [
        { name: dto.name, user: { id: user.id } },
        { key: dto.key, user: { id: user.id } }
      ]
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

    const account = Account.fromDto(dto, user);

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

  async updateAccount(@UserId() userId: string, id: string, dto: AccountUpdateRequestDto): Promise<Account> {
    this.logger.debug(`Updating account - AccountID: ${id}`);
    const account = await this.getAccountById(userId, id);

    if (!account) {
      this.logger.warn(`Account update failed - AccountID: ${id} - Reason: Account not found`);
      throw new AccountNotFoundException(id);
    }

    if (dto.name || dto.key) {
      const existingAccount = await this.accountRepository
        .createQueryBuilder('account')
        .where('account.userId = :userId', { userId: userId })
        .andWhere('account.id != :id', { id })
        .andWhere(
          new Brackets((qb) => {
            if (dto.name) {
              qb.orWhere('account.name = :name', { name: dto.name });
            }

            if (dto.key) {
              qb.orWhere('account.key = :key', { key: dto.key });
            }
          })
        )
        .getOne();

      if (existingAccount) {
        if (existingAccount.name === dto.name) {
          this.logger.warn(`Account update failed - Name: ${dto.name} - Reason: Account with this name already exists`);
        }

        if (existingAccount.key === dto.key) {
          this.logger.warn(
            `Account update failed - Key: ${maskString(dto.key)} - Reason: Account with this key already exists`
          );
        }

        throw new AccountAlreadyExistsException(dto.name, dto.key);
      }
    }

    account.updateFromDto(dto);

    const savedAccount = await this.accountRepository.save(account);
    this.eventEmitter.emit(Events.ACCOUNT_UPDATED, new AccountUpdatedEvent(savedAccount));
    this.logger.log(`Updated account - AccountID: ${savedAccount.id}`);
    return savedAccount;
  }

  async deleteAccount(@UserId() userId: string, id: string): Promise<Account> {
    this.logger.debug(`Deleting account - AccountID: ${id}`);
    const account = await this.getAccountById(userId, id);

    if (!account) {
      this.logger.warn(`Account deletion failed - AccountID: ${id} - Reason: Account not found`);
      throw new AccountNotFoundException(id);
    }

    await this.accountRepository.remove(account);
    this.eventEmitter.emit(Events.ACCOUNT_DELETED, new AccountDeletedEvent(account));
    this.logger.log(`Deleted account - AccountID: ${id}`);
    return account;
  }
}
