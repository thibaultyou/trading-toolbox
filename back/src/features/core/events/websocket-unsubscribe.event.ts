import { ApiProperty } from '@nestjs/swagger';

export class WebSocketUnsubscribeEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] })
  public readonly topics: string[] | string;

  constructor(accountId: string, topics: string[] | string) {
    this.accountId = accountId;
    this.topics = topics;
  }
}
