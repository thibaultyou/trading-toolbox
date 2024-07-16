import { ApiProperty } from '@nestjs/swagger';

import { Account } from '../entities/account.entity';

export class AccountDeleteResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the account.',
    example: '1660782b-9765-4ede-9f0f-94d235bbc170'
  })
  id: string;

  constructor(account: Account) {
    this.id = account.id;
  }
}
