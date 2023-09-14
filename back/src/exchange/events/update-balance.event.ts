import { ApiProperty } from '@nestjs/swagger';

export class UpdateBalanceEvent {
  @ApiProperty()
  public readonly accountName: string;

  @ApiProperty()
  public readonly data: any;

  constructor(accountName: string, data: any) {
    this.accountName = accountName;
    this.data = data;
  }
}
