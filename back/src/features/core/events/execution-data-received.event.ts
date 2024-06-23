import { ApiProperty } from '@nestjs/swagger';

import { IExecutionData } from '../core.interfaces';

export class ExecutionDataReceivedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly data: IExecutionData[];

  constructor(accountId: string, data: IExecutionData[]) {
    this.accountId = accountId;
    this.data = data;
  }
}
