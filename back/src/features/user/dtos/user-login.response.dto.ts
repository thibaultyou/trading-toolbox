import { ApiProperty } from '@nestjs/swagger';

import { Account } from '@account/entities/account.entity';

export class UserLoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token'
  })
  access_token: string;

  @ApiProperty({})
  accounts: Partial<Account>[];
}
