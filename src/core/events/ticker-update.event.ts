import { ApiProperty } from '@nestjs/swagger';

export class TickerUpdateEvent {
  @ApiProperty()
  public readonly topic: string;

  @ApiProperty()
  public readonly data: any;

  constructor(topic: string, data: any) {
    this.topic = topic;
    this.data = data;
  }
}
