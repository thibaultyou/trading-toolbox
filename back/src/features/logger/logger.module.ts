import { Global, Module } from '@nestjs/common';

import { LOGGER_PROVIDER_TOKEN } from '../../config';
import { AppLogger } from './logger.service';

@Global()
@Module({
  providers: [
    AppLogger,
    {
      provide: LOGGER_PROVIDER_TOKEN,
      useExisting: AppLogger
    }
  ],
  exports: [AppLogger, LOGGER_PROVIDER_TOKEN]
})
export class LoggerModule {}
