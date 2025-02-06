import { Injectable } from '@nestjs/common';

import { IBaseMapper } from '@common/interfaces/base-mapper.interface';
import { UserCreateRequestDto } from '@user/dtos/user-create.request.dto';
import { UserUpdateRequestDto } from '@user/dtos/user-update.request.dto';
import { UserDto } from '@user/dtos/user.dto';
import { User } from '@user/entities/user.entity';

@Injectable()
export class UserMapperService implements IBaseMapper<User, UserDto, UserCreateRequestDto, UserUpdateRequestDto> {
  toDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username
    };
  }

  createFromDto(dto: UserCreateRequestDto): User {
    const user = new User();
    user.username = dto.username;
    // NOTE The id will be undefined until the entity is saved in the database.
    return user;
  }

  updateFromDto(user: User, dto: UserUpdateRequestDto): User {
    if (dto.username !== undefined) {
      user.username = dto.username;
    }
    return user;
  }
}
