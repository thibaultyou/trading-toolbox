import { SetMetadata } from '@nestjs/common';

export const VALIDATE_ACCOUNT_KEY = 'validateAccount';

export const ValidateAccount = () => SetMetadata(VALIDATE_ACCOUNT_KEY, true);
