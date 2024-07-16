import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UserCreateRequestDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'The username for the new user'
  })
  @IsString()
  @MinLength(4)
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password for the new user'
  })
  @IsString()
  @MinLength(6)
  password: string;
}
