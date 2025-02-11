import { SetMetadata } from '@nestjs/common';

import { VALIDATE_ACCOUNT_KEY } from '@config';

export const ValidateAccount = () => SetMetadata(VALIDATE_ACCOUNT_KEY, true);
