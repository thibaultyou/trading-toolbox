import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class UserDto {
  @ApiProperty({
    example: '3f309063-cfd1-4ce8-ad74-77c94b01563f',
    description: 'The unique identifier of the user'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The username of the user'
  })
  @IsString()
  username: string;
}
