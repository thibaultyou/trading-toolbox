import { ApiProperty } from '@nestjs/swagger';

import { IWalletData } from '../core.interfaces';

export class WalletDataUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly data: IWalletData[];

  constructor(accountId: string, data: IWalletData[]) {
    this.accountId = accountId;
    this.data = data;
  }
}
