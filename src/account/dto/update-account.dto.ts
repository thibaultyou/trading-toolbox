import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  secret: string;
}
