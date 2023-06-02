import { ApiProperty } from '@nestjs/swagger';

export class BalanceUpdatedEvent {
  @ApiProperty()
  public readonly balance: number;

  constructor(balance: number) {
    this.balance = balance;
  }
}
