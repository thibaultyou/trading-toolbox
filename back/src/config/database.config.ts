import { cleanEnv, port, str } from 'envalid';

export const databaseConfig = cleanEnv(process.env, {
  DATABASE_HOST: str({ default: 'localhost' }),
  DATABASE_PORT: port({ default: 5432 }),
  DATABASE_USER: str({ default: 'postgres' }),
  DATABASE_PASSWORD: str({ default: 'postgres' }),
  DATABASE_NAME: str({ default: 'app' }),
});
