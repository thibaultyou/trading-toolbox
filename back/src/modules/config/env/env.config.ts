import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SERVER_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_HOST: z.string().min(1, 'DATABASE_HOST is required'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_USER: z.string().min(1, 'DATABASE_USER is required'),
  DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required'),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME is required'),
  JWT_SIGNING_SECRET: z.string().min(1, 'JWT_SIGNING_SECRET is required'),
  WS_CORS_ORIGIN: z.string().default('*'),
  WS_NAMESPACE: z.string().default('/ws')
});

export type IEnvConfiguration = z.infer<typeof EnvSchema>;

export const envConfig: IEnvConfiguration = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  SERVER_PORT: process.env.SERVER_PORT,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,
  JWT_SIGNING_SECRET: process.env.JWT_SIGNING_SECRET,
  WS_CORS_ORIGIN: process.env.WS_CORS_ORIGIN,
  WS_NAMESPACE: process.env.WS_NAMESPACE
});
