import { ApiProperty } from '@nestjs/swagger';

export class ReceiveAlertDto {
  @ApiProperty()
  test: string;
}
