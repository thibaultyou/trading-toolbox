import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ExchangeType } from '../../../exchange/exchange.types';
import { AccountCreateRequestDto } from '../account-create.request.dto';

describe('AccountCreateRequestDto', () => {
  it('should validate that all fields are correctly defined and valid', async () => {
    const dto = plainToInstance(AccountCreateRequestDto, {
      name: 'Test Account',
      key: 'testKey',
      secret: 'testSecret',
      exchange: ExchangeType.Bybit
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if fields are missing', async () => {
    const dto = plainToInstance(AccountCreateRequestDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(4);
  });

  it('should fail validation if exchange type is invalid', async () => {
    const dto = plainToInstance(AccountCreateRequestDto, {
      name: 'Test Account',
      key: 'testKey',
      secret: 'testSecret',
      exchange: 'InvalidExchangeType'
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('exchange');
  });
});
