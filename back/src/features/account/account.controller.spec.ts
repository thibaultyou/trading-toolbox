import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ExchangeType } from '../exchange/exchange.types';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountResponseDto } from './dto/account.response.dto';
import { AccountCreateRequestDto } from './dto/account-create.request.dto';
import { AccountUpdateRequestDto } from './dto/account-update.request.dto';
import { Account } from './entities/account.entity';
import { AccountNotFoundException } from './exceptions/account.exceptions';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;

  beforeEach(async () => {
    const existingAccount = new Account(
      'Existing Account',
      'existingKey',
      'existingSecret',
      ExchangeType.Bybit,
    );

    existingAccount.id = 'existing-id';

    const updatedAccount = new Account(
      'Updated Account',
      'updatedKey',
      'updatedSecret',
      ExchangeType.MEXC,
    );

    updatedAccount.id = 'existing-id';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest
              .fn()
              .mockImplementation((id: string) =>
                id === existingAccount.id ? existingAccount : null,
              ),
            create: jest.fn().mockResolvedValue(existingAccount),
            update: jest
              .fn()
              .mockImplementation((id: string, _: Account) =>
                id === existingAccount.id ? updatedAccount : null,
              ),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an empty array of accounts when no accounts exist', async () => {
      const result: AccountResponseDto[] = [];

      jest.spyOn(service, 'findAll').mockResolvedValue(result);
      expect(await controller.findAll()).toEqual(result);
    });

    it('should return an array of accounts when accounts exist', async () => {
      const accountEntities = [
        new Account('Account 1', 'key1', 'secret1', ExchangeType.Bybit),
        new Account('Account 2', 'key2', 'secret2', ExchangeType.MEXC),
      ];

      accountEntities[0].id = 'uuid-1';
      accountEntities[1].id = 'uuid-2';

      const accountDtos = accountEntities.map(
        (account) => new AccountResponseDto(account),
      );

      jest.spyOn(service, 'findAll').mockResolvedValue(accountEntities);
      const response = await controller.findAll();

      expect(response).toStrictEqual(accountDtos);
    });
  });

  describe('findOne', () => {
    it('should return an account if it exists', async () => {
      const account = new Account(
        'Existing Account',
        'existingKey',
        'existingSecret',
        ExchangeType.Bybit,
      );

      account.id = 'existing-id';
      jest.spyOn(service, 'findOne').mockResolvedValue(account);
      expect(await controller.findOne('existing-id')).toEqual(
        new AccountResponseDto(account),
      );
    });

    it('should throw AccountNotFoundException if no account is found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      await expect(controller.findOne('non-existing-id')).rejects.toThrow(
        AccountNotFoundException,
      );
    });
  });

  describe('create', () => {
    const dto: AccountCreateRequestDto = {
      name: 'Random Name',
      key: 'randomKey123',
      secret: 'randomSecret123',
      exchange: ExchangeType.Bybit,
    };

    const createdAccount: Account = new Account(
      dto.name,
      dto.key,
      dto.secret,
      dto.exchange,
    );

    createdAccount.id = 'uuid-random-1';

    it('should create a new account', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(createdAccount);
      expect(await controller.create(dto)).toEqual(
        new AccountResponseDto(createdAccount),
      );
    });

    it('should throw ConflictException if creating a duplicate name', async () => {
      jest.spyOn(service, 'create').mockImplementation(() => {
        throw new ConflictException('An account with this name already exists');
      });

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update an account if it exists', async () => {
      const account = new Account(
        'Updated Account',
        'updatedKey',
        'updatedSecret',
        ExchangeType.MEXC,
      );

      account.id = 'existing-id';
      const dto: AccountUpdateRequestDto = {
        name: 'Updated Account',
        key: 'updatedKey',
        secret: 'updatedSecret',
        exchange: ExchangeType.MEXC,
      };

      jest.spyOn(service, 'update').mockResolvedValue(account);
      expect(await controller.update('existing-id', dto)).toEqual(
        new AccountResponseDto(account),
      );
    });

    it('should throw AccountNotFoundException if no account is found for update', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(null);
      await expect(
        controller.update('non-existing-id', new AccountUpdateRequestDto()),
      ).rejects.toThrow(AccountNotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an account if it exists', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(true);
      await expect(controller.delete('1')).resolves.not.toThrow();
    });

    it('should throw AccountNotFoundException if no account is found for deletion', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(false);
      await expect(controller.delete('1')).rejects.toThrow(
        AccountNotFoundException,
      );
    });
  });
});
