import { ApiProperty } from '@nestjs/swagger';

export class TopicUnsubscribedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly topicName: string;

  constructor(accountId: string, topicName: string) {
    this.accountId = accountId;
    this.topicName = topicName;
  }
}
