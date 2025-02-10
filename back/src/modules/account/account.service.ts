import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Events } from '@config';
import { ExchangeFactory } from '@exchange/services/exchange-service.factory';
import { User } from '@user/entities/user.entity';

import { maskString } from './account.utils';
import { AccountCreateRequestDto } from './dtos/account-create.request.dto';
import { AccountUpdateRequestDto } from './dtos/account-update.request.dto';
import { Account } from './entities/account.entity';
import { AccountCreatedEvent } from './events/account-created.event';
import { AccountDeletedEvent } from './events/account-deleted.event';
import { AccountUpdatedEvent } from './events/account-updated.event';
import { AccountAlreadyExistsException, AccountNotFoundException } from './exceptions/account.exceptions';
import { AccountMapperService } from './services/account-mapper.service';

@Injectable()
export class AccountService {
  private logger = new Logger(AccountService.name);

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private eventEmitter: EventEmitter2,
    private exchangeFactory: ExchangeFactory,
    private accountMapper: AccountMapperService
  ) {}

  async getUserAccounts(userId: string): Promise<Account[]> {
    this.logger.debug(`getUserAccounts() - start | userId=${userId}`);
    const accounts = await this.accountRepository.find({
      where: { user: { id: userId } }
    });
    this.logger.log(`getUserAccounts() - success | userId=${userId}, count=${accounts.length}`);
    return accounts;
  }

  async getAllAccountsForSystem(): Promise<Account[]> {
    this.logger.debug('getAllAccountsForSystem() - start');
    const accounts = await this.accountRepository.find();
    this.logger.log(`getAllAccountsForSystem() - success | count=${accounts.length}`);
    return accounts;
  }

  async getAccountById(userId: string, accountId: string): Promise<Account> {
    this.logger.debug(`getAccountById() - start | userId=${userId}, accountId=${accountId}`);
    const account = await this.accountRepository.findOne({
      where: { id: accountId, user: { id: userId } }
    });

    if (!account) {
      this.logger.warn(`getAccountById() - not found | userId=${userId}, accountId=${accountId}`);
      throw new AccountNotFoundException(accountId);
    }

    this.logger.log(`getAccountById() - success | userId=${userId}, accountId=${accountId}`);
    return account;
  }

  async validateUserAccount(userId: string, accountId: string): Promise<Account> {
    this.logger.debug(`validateUserAccount() - start | userId=${userId}, accountId=${accountId}`);
    const account = await this.getAccountById(userId, accountId);
    this.logger.log(`validateUserAccount() - success | userId=${userId}, accountId=${accountId}`);
    return account;
  }

  async getAccountByIdForSystem(accountId: string): Promise<Account> {
    this.logger.debug(`getAccountByIdForSystem() - start | accountId=${accountId}`);
    const account = await this.accountRepository.findOne({ where: { id: accountId } });

    if (!account) {
      this.logger.warn(`getAccountByIdForSystem() - not found | accountId=${accountId}`);
      throw new AccountNotFoundException(accountId);
    }

    this.logger.log(`getAccountByIdForSystem() - success | accountId=${accountId}`);
    return account;
  }

  async createAccount(user: User, dto: AccountCreateRequestDto): Promise<Account> {
    this.logger.debug(`createAccount() - start | userId=${user.id}, name=${dto.name}`);
    const existingAccount = await this.accountRepository.findOne({
      where: [
        { name: dto.name, user: { id: user.id } },
        { key: dto.key, user: { id: user.id } }
      ]
    });

    if (existingAccount) {
      if (existingAccount.name === dto.name) {
        this.logger.warn(`createAccount() - conflict | reason=Name already exists, name=${dto.name}`);
      }

      if (existingAccount.key === dto.key) {
        this.logger.warn(`createAccount() - conflict | reason=Key already exists, key=${maskString(dto.key)}`);
      }

      throw new AccountAlreadyExistsException(dto.name, dto.key);
    }

    const account = this.accountMapper.createFromDto(dto, user);

    try {
      this.logger.debug(`createAccount() - exchange factory init | accountName=${account.name}`);
      await this.exchangeFactory.createExchange(account);
      this.logger.log(`createAccount() - exchange factory success | accountName=${account.name}`);
    } catch (error) {
      this.logger.error(`createAccount() - exchange factory error | msg=${error.message}`, error.stack);
      throw error;
    }

    const savedAccount = await this.accountRepository.save(account);
    this.eventEmitter.emit(Events.Account.CREATED, new AccountCreatedEvent(savedAccount));
    this.logger.log(`createAccount() - success | accountId=${savedAccount.id}, name=${savedAccount.name}`);
    return savedAccount;
  }

  async updateAccount(userId: string, accountId: string, dto: AccountUpdateRequestDto): Promise<Account> {
    this.logger.debug(`updateAccount() - start | userId=${userId}, accountId=${accountId}`);
    const account = await this.getAccountById(userId, accountId);

    if (dto.name || dto.key) {
      const existingAccount = await this.accountRepository
        .createQueryBuilder('account')
        .where('account.userId = :userId', { userId: userId })
        .andWhere('account.id != :id', { id: accountId })
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
          this.logger.warn(`updateAccount() - conflict | reason=Name already exists, name=${dto.name}`);
        }

        if (existingAccount.key === dto.key) {
          this.logger.warn(`updateAccount() - conflict | reason=Key already exists, key=${maskString(dto.key)}`);
        }

        throw new AccountAlreadyExistsException(dto.name, dto.key);
      }
    }

    const updatedAccount = this.accountMapper.updateFromDto(account, dto);
    const savedAccount = await this.accountRepository.save(updatedAccount);
    this.eventEmitter.emit(Events.Account.UPDATED, new AccountUpdatedEvent(savedAccount));
    this.logger.log(`updateAccount() - success | accountId=${savedAccount.id}`);
    return savedAccount;
  }

  async deleteAccount(userId: string, accountId: string): Promise<Account> {
    this.logger.debug(`deleteAccount() - start | userId=${userId}, accountId=${accountId}`);
    const account = await this.getAccountById(userId, accountId);
    await this.accountRepository.remove(account);
    this.eventEmitter.emit(Events.Account.DELETED, new AccountDeletedEvent(account));
    this.logger.log(`deleteAccount() - success | accountId=${accountId}`);
    return account;
  }
}
