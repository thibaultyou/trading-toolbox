import { IO } from 'fp-ts/IO';

export interface ILogger {
  debug: (msg: string) => IO<void>;
  error: (msg: string, trace?: string) => IO<void>;
  log: (msg: string) => IO<void>;
  warn: (msg: string) => IO<void>;
  fatal: (msg: string) => IO<void>;
  verbose: (msg: string) => IO<void>;
}
