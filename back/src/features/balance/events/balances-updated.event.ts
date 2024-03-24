import { ApiProperty } from '@nestjs/swagger';
import { Balances } from 'ccxt';

export class BalancesUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty({ type: () => Object })
  public readonly balances: Balances;

  constructor(accountId: string, balances: Balances) {
    this.accountId = accountId;
    this.balances = balances;
  }
}
