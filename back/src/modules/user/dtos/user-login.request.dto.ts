import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UserLoginRequestDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'The username of the user'
  })
  @IsString()
  @MinLength(4)
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user'
  })
  @IsString()
  @MinLength(6)
  password: string;
}
