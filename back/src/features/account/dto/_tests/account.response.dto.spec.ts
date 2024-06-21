import { maskString } from '../../../../common/utils/string.util';
import { ExchangeType } from '../../../exchange/exchange.types';
import { Account } from '../../entities/account.entity';
import { AccountResponseDto } from '../account-read.response.dto';

describe('AccountResponseDto', () => {
  it('should correctly initialize from an Account entity', () => {
    const name = 'Test Account';
    const key = 'testKey';
    const secret = 'testSecret';
    const exchange = ExchangeType.Bybit;
    const account = new Account(name, key, secret, exchange);
    const dto = new AccountResponseDto(account);
    expect(dto.name).toBe(account.name);
    expect(dto.key).toBe(maskString(account.key));
    expect(dto.secret).toBe('********');
    expect(dto.exchange).toBe(account.exchange);
  });
});
