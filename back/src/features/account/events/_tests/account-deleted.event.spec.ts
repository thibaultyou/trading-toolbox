import { ExchangeType } from '../../../exchange/exchange.types';
import { Account } from '../../entities/account.entity';
import { AccountDeletedEvent } from '../account-deleted.event';

describe('AccountDeletedEvent', () => {
  it('should correctly assign an Account upon instantiation', () => {
    const sampleAccount = new Account('Test Account', 'testKey', 'testSecret', ExchangeType.Bybit);
    sampleAccount.id = 'test-id';

    const event = new AccountDeletedEvent(sampleAccount);
    expect(event.account).toBeDefined();
    expect(event.account).toBeInstanceOf(Account);
    expect(event.account.id).toEqual(sampleAccount.id);
    expect(event.account.name).toEqual(sampleAccount.name);
    expect(event.account.key).toEqual(sampleAccount.key);
    expect(event.account.secret).toEqual(sampleAccount.secret);
    expect(event.account.exchange).toEqual(sampleAccount.exchange);
  });
});
