import { Global, Module } from '@nestjs/common';

import { CONFIG_TOKEN } from '@config';

import { AppLogger } from './logger.service';

@Global()
@Module({
  providers: [
    {
      provide: AppLogger,
      useFactory: (config) => new AppLogger(config),
      inject: [CONFIG_TOKEN]
    }
  ],
  exports: [AppLogger]
})
export class LoggerModule {}
