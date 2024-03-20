import { ExchangeType } from '../../../exchange/exchange.types';
import { AccountCreateRequestDto } from '../../dto/account-create.request.dto';
import { AccountUpdateRequestDto } from '../../dto/account-update.request.dto';
import { Account } from '../account.entity';

describe('Account Entity', () => {
  describe('fromDto', () => {
    it('should correctly initialize from an AccountCreateRequestDto', () => {
      const dto: AccountCreateRequestDto = {
        name: 'Test Account',
        key: 'testKey',
        secret: 'testSecret',
        exchange: ExchangeType.Bybit,
      };

      const account = Account.fromDto(dto);

      expect(account.name).toEqual(dto.name);
      expect(account.key).toEqual(dto.key);
      expect(account.secret).toEqual(dto.secret);
      expect(account.exchange).toEqual(dto.exchange);
    });

    it('should correctly initialize from an AccountUpdateRequestDto', () => {
      const dto: AccountUpdateRequestDto = {
        name: 'Updated Account',
        key: 'updatedKey',
        secret: 'updatedSecret',
        exchange: ExchangeType.MEXC,
      };

      const account = Account.fromDto(dto);

      expect(account.name).toEqual(dto.name);
      expect(account.key).toEqual(dto.key);
      expect(account.secret).toEqual(dto.secret);
      expect(account.exchange).toEqual(dto.exchange);
    });
  });
});
