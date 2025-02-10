import { Logger, LogLevel } from '@nestjs/common';
import { IO } from 'fp-ts/IO';
import * as TE from 'fp-ts/TaskEither';

const log =
  (logger: Logger, level: LogLevel, message: string): IO<void> =>
  () =>
    logger[level](message);

export const logEffect =
  <T>(logger: Logger, message: string): ((t: T) => TE.TaskEither<never, T>) =>
  (t: T) =>
    TE.rightIO(() => {
      log(logger, 'log', message)();
      return t;
    });

export const logError =
  (logger: Logger, message: string): ((e: Error) => TE.TaskEither<Error, never>) =>
  (e: Error) =>
    TE.leftIO(() => {
      log(logger, 'error', `${message} - error | msg=${e.message}`)();
      return e;
    });

export const logDebug =
  <T>(logger: Logger, message: string): ((t: T) => TE.TaskEither<never, T>) =>
  (t: T) =>
    TE.rightIO(() => {
      log(logger, 'debug', message)();
      return t;
    });

export const logWarn =
  <T>(logger: Logger, message: string): ((t: T) => TE.TaskEither<never, T>) =>
  (t: T) =>
    TE.rightIO(() => {
      log(logger, 'warn', message)();
      return t;
    });

export const logVerbose =
  <T>(logger: Logger, message: string): ((t: T) => TE.TaskEither<never, T>) =>
  (t: T) =>
    TE.rightIO(() => {
      log(logger, 'verbose', message)();
      return t;
    });

export const logFatal =
  (logger: Logger, message: string): ((e: Error) => TE.TaskEither<Error, never>) =>
  (e: Error) =>
    TE.leftIO(() => {
      log(logger, 'fatal', `${message} - ${e.message}`)();
      return e;
    });
