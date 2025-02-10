import { IAccountTracker } from '@common/interfaces/account-tracker.interface';

export interface IExchangeWebsocketService extends IAccountTracker {
  subscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic?: boolean): Promise<void>;
  unsubscribe(accountId: string, wsTopics: string[] | string, isPrivateTopic?: boolean): void;
}
