import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ExchangeType } from '../../../exchange/exchange.types';
import { AccountUpdateRequestDto } from '../account-update.request.dto';

describe('AccountUpdateRequestDto', () => {
  it('should validate successfully with all optional fields provided', async () => {
    const dto = plainToInstance(AccountUpdateRequestDto, {
      name: 'Updated Account',
      key: 'updatedKey123',
      secret: 'updatedSecret123',
      exchange: ExchangeType.Bybit
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate successfully with no fields provided', async () => {
    const dto = plainToInstance(AccountUpdateRequestDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate successfully with some fields provided', async () => {
    const dto = plainToInstance(AccountUpdateRequestDto, {
      name: 'Partially Updated Account',
      exchange: ExchangeType.MEXC
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation for invalid exchange type', async () => {
    const dto = plainToInstance(AccountUpdateRequestDto, {
      exchange: 'InvalidExchange'
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('exchange');
  });
});
