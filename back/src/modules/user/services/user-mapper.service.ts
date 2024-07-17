import { Injectable } from '@nestjs/common';

import { UserCreateRequestDto } from '@user/dtos/user-create.request.dto';
import { UserUpdateRequestDto } from '@user/dtos/user-update.request.dto';
import { UserDto } from '@user/dtos/user.dto';
import { User } from '@user/entities/user.entity';

@Injectable()
export class UserMapperService {
  toDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username
    };
  }

  fromCreateDto(dto: UserCreateRequestDto): Partial<User> {
    return {
      username: dto.username
    };
  }

  updateFromDto(user: User, dto: UserUpdateRequestDto): User {
    if (dto.username !== undefined) user.username = dto.username;
    return user;
  }
}
