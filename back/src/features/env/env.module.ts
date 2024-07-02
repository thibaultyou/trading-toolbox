import { Global, Module } from '@nestjs/common';

import { CONFIG_TOKEN, envConfig } from '../../config';

@Global()
@Module({
  providers: [
    {
      provide: CONFIG_TOKEN,
      useValue: envConfig
    }
  ],
  exports: [CONFIG_TOKEN]
})
export class EnvModule {}
