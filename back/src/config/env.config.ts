import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_HOST: z.string().default('db'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  JWT_SIGNING_SECRET: z.string(),
  WS_CORS_ORIGIN: z.string().default('*'),
  WS_NAMESPACE: z.string().default('/ws')
});

export type IEnvConfiguration = z.infer<typeof EnvSchema>;

export const envConfig: IEnvConfiguration = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,
  JWT_SIGNING_SECRET: process.env.JWT_SIGNING_SECRET,
  WS_CORS_ORIGIN: process.env.WS_CORS_ORIGIN,
  WS_NAMESPACE: process.env.WS_NAMESPACE
});

export const CONFIG_TOKEN = 'CONFIG' as const;
