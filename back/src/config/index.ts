/* eslint-disable padding-line-between-statements */
export * from './env.config';
export * from './event-handlers.config';
export * from './events.config';
export * from './timers.config';
export * from './urls.config';
export * from './websocket.config';

import { envConfig } from './env.config';
import { EventHandlersContext } from './event-handlers.config';
import { Events } from './events.config';
import { Timers } from './timers.config';
import { Urls } from './urls.config';
import { websocketConfig } from './websocket.config';

export const Config = {
  env: envConfig,
  eventHandlers: EventHandlersContext,
  events: Events,
  timers: Timers,
  urls: Urls,
  websocket: websocketConfig
} as const;

export type ConfigType = typeof Config;
