import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Events } from '../../config';
import { ExchangeType } from '../exchange/exchange.types';

import { AccountService } from './account.service';
import { Account } from './entities/account.entity';
import {
  AccountNotFoundException,
  AccountAlreadyExistsException,
} from './exceptions/account.exceptions';

describe('AccountService', () => {
  let service: AccountService;
  let repository: Repository<Account>;
  let eventEmitter: EventEmitter2;

  const accountArray = [
    new Account('Test Account 1', 'key1', 'secret1', ExchangeType.Bybit),
    new Account('Test Account 2', 'key2', 'secret2', ExchangeType.MEXC),
  ];
  const account = new Account(
    'Test Account',
    'key',
    'secret',
    ExchangeType.Bybit,
  );
  account.id = '1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(Account),
          useValue: {
            find: jest.fn().mockResolvedValue(accountArray),
            findOne: jest.fn().mockResolvedValue(account),
            save: jest.fn().mockResolvedValue(account),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    repository = module.get<Repository<Account>>(getRepositoryToken(Account));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(eventEmitter).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of accounts', async () => {
      await expect(service.findAll()).resolves.toEqual(accountArray);
    });
  });

  describe('findOne', () => {
    it('should return a single account if found by ID', async () => {
      await expect(service.findOne('1')).resolves.toEqual(account);
    });

    it('should throw an AccountNotFoundException if no account is found by ID', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne('non-existing-id')).rejects.toThrow(
        AccountNotFoundException,
      );
    });
  });

  describe('findOneByName', () => {
    it('should return a single account if found by name', async () => {
      await expect(service.findOneByName('Test Account')).resolves.toEqual(
        account,
      );
    });

    it('should throw an AccountNotFoundException if no account is found by name', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOneByName('non-existing')).rejects.toThrow(
        AccountNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should successfully create an account', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.create(account)).resolves.toEqual(account);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        Events.ACCOUNT_CREATED,
        expect.anything(),
      );
    });

    it('should throw an AccountAlreadyExistsException if account name already exists', async () => {
      await expect(service.create(account)).rejects.toThrow(
        AccountAlreadyExistsException,
      );
    });
  });

  describe('update', () => {
    const updatedAccountData = new Account(
      'Updated Account',
      'updatedKey',
      'updatedSecret',
      ExchangeType.MEXC,
    );
    updatedAccountData.id = '1';

    it('should successfully update an existing account', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(account);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(updatedAccountData);

      await expect(
        service.update(account.id, updatedAccountData),
      ).resolves.toEqual(updatedAccountData);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        Events.ACCOUNT_UPDATED,
        expect.anything(),
      );
    });

    it('should throw an AccountNotFoundException if the account does not exist', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new AccountNotFoundException('non-existing-id'));

      await expect(
        service.update('non-existing-id', updatedAccountData),
      ).rejects.toThrow(AccountNotFoundException);
    });
  });

  describe('delete', () => {
    it('should successfully delete an existing account', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(account);

      await expect(service.delete(account.id)).resolves.toEqual(true);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        Events.ACCOUNT_DELETED,
        expect.anything(),
      );
    });

    it('should throw an AccountNotFoundException if the account does not exist', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new AccountNotFoundException('non-existing-id'));

      await expect(service.delete('non-existing-id')).rejects.toThrow(
        AccountNotFoundException,
      );
    });
  });
});
