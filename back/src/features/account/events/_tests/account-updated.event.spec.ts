import { ExchangeType } from '../../../exchange/exchange.types';
import { Account } from '../../entities/account.entity';
import { AccountUpdatedEvent } from '../account-updated.event';

describe('AccountUpdatedEvent', () => {
  it('should correctly assign an Account upon instantiation', () => {
    const sampleAccount = new Account('Updated Account', 'updatedKey', 'updatedSecret', ExchangeType.MEXC);

    sampleAccount.id = 'updated-id';

    const event = new AccountUpdatedEvent(sampleAccount);

    expect(event.account).toBeDefined();
    expect(event.account).toBeInstanceOf(Account);
    expect(event.account.id).toEqual(sampleAccount.id);
    expect(event.account.name).toEqual(sampleAccount.name);
    expect(event.account.key).toEqual(sampleAccount.key);
    expect(event.account.secret).toEqual(sampleAccount.secret);
    expect(event.account.exchange).toEqual(sampleAccount.exchange);
  });
});
