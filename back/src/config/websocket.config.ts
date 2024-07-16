import { envConfig } from './env.config';

export const websocketConfig = {
  cors: {
    origin: envConfig.WS_CORS_ORIGIN.split(',')
  },
  namespace: envConfig.WS_NAMESPACE
} as const;

export type WebsocketConfigType = typeof websocketConfig;
