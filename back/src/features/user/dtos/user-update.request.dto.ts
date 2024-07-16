import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';

export class UserUpdateRequestDto {
  @ApiProperty({
    example: 'newusername',
    description: 'The new username of the user',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  username?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'The new password of the user',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
