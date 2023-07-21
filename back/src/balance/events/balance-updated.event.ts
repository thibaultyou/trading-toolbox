import { ApiProperty } from '@nestjs/swagger';

export class BalanceUpdatedEvent {
  @ApiProperty()
  public readonly accountName: string;

  @ApiProperty()
  public readonly balance: number;

  constructor(accountName: string, balance: number) {
    this.accountName = accountName;
    this.balance = balance;
  }
}
