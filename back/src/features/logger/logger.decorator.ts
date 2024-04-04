import { Inject } from '@nestjs/common';

import { LOGGER_PROVIDER_TOKEN } from '../../config';

export const InjectLogger = () => Inject(LOGGER_PROVIDER_TOKEN);
