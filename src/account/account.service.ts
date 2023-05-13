import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { AccountCreatedEvent } from './events/account-created.event';
import { AccountUpdatedEvent } from './events/account-updated.event';
import { AccountDeletedEvent } from './events/account-deleted.event';

@Injectable()
export class AccountService {
    constructor(
        private eventEmitter: EventEmitter2,
        @InjectRepository(Account)
        private accountRepository: Repository<Account>,
    ) { }

    findAll(): Promise<Account[]> {
        return this.accountRepository.find();
    }

    async findOne(id: string): Promise<Account> {
        const account = await this.accountRepository.findOne({
            where: {
                id,
            },
        });
        return account;
    }

    async create(name: string, key: string, secret: string): Promise<Account> {
        const account = new Account(name, key, secret);
        const savedAccount = await this.accountRepository.save(account);
        this.eventEmitter.emit('account.created', new AccountCreatedEvent(savedAccount.id, savedAccount.name));
        return savedAccount;
    }

    async update(id: string, name: string, key: string, secret: string): Promise<Account> {
        const account = await this.findOne(id);
        account.name = name;
        account.key = key;
        account.secret = secret;
        const updatedAccount = await this.accountRepository.save(account);
        this.eventEmitter.emit('account.updated', new AccountUpdatedEvent(updatedAccount.id, updatedAccount.name));
        return updatedAccount;
    }

    async delete(id: string): Promise<void> {
        await this.accountRepository.delete(id);
        this.eventEmitter.emit('account.deleted', new AccountDeletedEvent(id));
    }
}
