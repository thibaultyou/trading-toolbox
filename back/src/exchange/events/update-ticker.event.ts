import { ApiProperty } from '@nestjs/swagger';

export class UpdateTickerEvent {
  @ApiProperty()
  public readonly accountName: string;

  @ApiProperty()
  public readonly topic: string;

  @ApiProperty()
  public readonly data: any;

  constructor(accountName: string, topic: string, data: any) {
    this.accountName = accountName;
    this.topic = topic;
    this.data = data;
  }
}
