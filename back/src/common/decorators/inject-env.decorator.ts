import { Inject } from '@nestjs/common';

import { CONFIG_TOKEN } from '@config/env.config';

export const InjectConfig = () => Inject(CONFIG_TOKEN);
