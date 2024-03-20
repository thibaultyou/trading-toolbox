import { ExchangeType } from '../../../exchange/exchange.types';
import { Account } from '../../entities/account.entity';
import { AccountCreatedEvent } from '../account-created.event';

describe('AccountCreatedEvent', () => {
  it('should correctly assign an Account upon instantiation', () => {
    const sampleAccount = new Account(
      'Sample Name',
      'SampleKey',
      'SampleSecret',
      ExchangeType.Bybit,
    );
    sampleAccount.id = 'sample-id';

    const event = new AccountCreatedEvent(sampleAccount);

    expect(event.account).toBeDefined();
    expect(event.account).toBeInstanceOf(Account);
    expect(event.account.id).toEqual(sampleAccount.id);
    expect(event.account.name).toEqual(sampleAccount.name);
    expect(event.account.key).toEqual(sampleAccount.key);
    expect(event.account.secret).toEqual(sampleAccount.secret);
    expect(event.account.exchange).toEqual(sampleAccount.exchange);
  });
});
