import { ApiProperty } from '@nestjs/swagger';
import { TriggerType, StatusType } from '../setup.types';
import { Action } from '../entities/action.entity';

export class SetupCreatedEvent {
  @ApiProperty()
  public readonly setupId: string;

  @ApiProperty()
  public readonly ticker: string;

  @ApiProperty()
  public readonly size: string;

  @ApiProperty()
  public readonly account: string;

  @ApiProperty()
  public readonly trigger: TriggerType;

  @ApiProperty()
  public readonly value: number;

  @ApiProperty()
  public readonly status: StatusType;

  @ApiProperty({ type: () => [Action] })
  public readonly actions: Action[];

  constructor(
    setupId: string,
    ticker: string,
    size: string,
    account: string,
    trigger: TriggerType,
    value: number,
    status: StatusType,
    actions: Action[],
  ) {
    this.setupId = setupId;
    this.ticker = ticker;
    this.size = size;
    this.account = account;
    this.trigger = trigger;
    this.value = value;
    this.status = status;
    this.actions = actions;
  }
}
