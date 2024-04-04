import { IO } from 'fp-ts/IO';

export interface ILogger {
  debug: (msg: string) => IO<void>;
  error: (msg: string, err?: Error) => IO<void>;
  info: (msg: string) => IO<void>;
  warn: (msg: string) => IO<void>;
}
