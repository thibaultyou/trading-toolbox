export interface IEnvConfiguration {
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  JWT_SECRET: string;
  WS_CORS_ORIGIN: string;
  WS_NAMESPACE: string;
}

export const envConfig: IEnvConfiguration = {
  NODE_ENV: (process.env.NODE_ENV as IEnvConfiguration['NODE_ENV']) || 'development',
  DATABASE_HOST: process.env.DATABASE_HOST || 'db',
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '5432', 10),
  DATABASE_USER: process.env.DATABASE_USER || '',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || '',
  DATABASE_NAME: process.env.DATABASE_NAME || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  WS_CORS_ORIGIN: process.env.WS_CORS_ORIGIN || '*',
  WS_NAMESPACE: process.env.WS_NAMESPACE || '/ws'
};

export const CONFIG_TOKEN = 'CONFIG';
