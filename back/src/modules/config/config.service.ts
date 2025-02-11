import { Injectable } from '@nestjs/common';

import { Timers, TimersType } from './app/timers.config';
import { Urls, UrlsType } from './app/urls.config';
import { envConfig, IEnvConfiguration } from './env/env.config';
import { Events, EventsType } from './events/events.config';
import { EventHandlersContext, EventHandlersContextType } from './events/handlers.config';

@Injectable()
export class ConfigService {
  get env(): IEnvConfiguration {
    return envConfig;
  }

  get handlers(): Record<string, EventHandlersContextType> {
    return EventHandlersContext;
  }

  get events(): EventsType {
    return Events;
  }

  get timers(): Record<TimersType, number> {
    return Timers;
  }

  get urls(): Record<UrlsType, string> {
    return Urls;
  }
}
