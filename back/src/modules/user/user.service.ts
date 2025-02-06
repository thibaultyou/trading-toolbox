import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Events } from '@config';

import { UserCreateRequestDto } from './dtos/user-create.request.dto';
import { UserLoginRequestDto } from './dtos/user-login.request.dto';
import { UserLoginResponseDto } from './dtos/user-login.response.dto';
import { UserUpdateRequestDto } from './dtos/user-update.request.dto';
import { UserDto } from './dtos/user.dto';
import { User } from './entities/user.entity';
import { UserCreatedEvent } from './events/user-created.event';
import { UserDeletedEvent } from './events/user-deleted.event';
import { UserUpdatedEvent } from './events/user-updated.event';
import {
  UserAlreadyExistsException,
  UserOperationFailedException,
  InvalidUserCredentialsException,
  UserNotFoundException
} from './exceptions/user.exceptions';
import { PasswordService } from './services/password.service';
import { UserMapperService } from './services/user-mapper.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userMapper: UserMapperService
  ) {}

  async createUser(dto: UserCreateRequestDto): Promise<UserDto> {
    this.logger.debug(`createUser() - start | username=${dto.username}`);

    try {
      await this.checkExistingUser(dto.username);

      const hashedPassword = await this.passwordService.hashPassword(dto.password);
      const userData = this.userMapper.createFromDto(dto);
      userData.password = hashedPassword;

      const savedUser = await this.saveUser(userData);
      const userDto = this.userMapper.toDto(savedUser);
      this.eventEmitter.emit(Events.User.CREATED, new UserCreatedEvent(userDto.id, userDto.username));
      this.logger.log(`createUser() - success | userId=${userDto.id}, username=${userDto.username}`);
      return userDto;
    } catch (error) {
      this.logger.error(`createUser() - error | username=${dto.username}, msg=${error.message}`, error.stack);

      if (error instanceof UserAlreadyExistsException) throw error;

      throw new UserOperationFailedException('createUser', error.message);
    }
  }

  async authenticateUser(dto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    this.logger.debug(`authenticateUser() - start | username=${dto.username}`);

    try {
      const user = await this.findUserWithAccounts(dto.username);
      const isValid = await this.passwordService.verifyPassword(dto.password, user.password);

      if (!isValid) {
        this.logger.warn(`authenticateUser() - invalid password | username=${dto.username}`);
        throw new InvalidUserCredentialsException(dto.username);
      }

      const token = this.generateToken(user);
      const response = this.createLoginResponse(user, token);
      this.logger.log(`authenticateUser() - success | userId=${user.id}, username=${user.username}`);
      return response;
    } catch (error) {
      this.logger.error(`authenticateUser() - error | username=${dto.username}, msg=${error.message}`, error.stack);

      if (error instanceof InvalidUserCredentialsException) throw error;

      throw new UserOperationFailedException('authenticateUser', error.message);
    }
  }

  async getUserById(userId: string): Promise<UserDto> {
    this.logger.debug(`getUserById() - start | userId=${userId}`);

    try {
      const user = await this.findUserById(userId);
      const userDto = this.userMapper.toDto(user);
      this.logger.log(`getUserById() - success | userId=${userId}`);
      return userDto;
    } catch (error) {
      this.logger.error(`getUserById() - error | userId=${userId}, msg=${error.message}`, error.stack);

      if (error instanceof UserNotFoundException) throw error;

      throw new UserOperationFailedException('getUserById', error.message);
    }
  }

  async updateUser(userId: string, dto: UserUpdateRequestDto): Promise<UserDto> {
    this.logger.debug(`updateUser() - start | userId=${userId}`);

    try {
      const user = await this.findUserById(userId);
      const updatedUser = this.userMapper.updateFromDto(user, dto);

      if (dto.password) {
        updatedUser.password = await this.passwordService.hashPassword(dto.password);
      }

      const savedUser = await this.usersRepository.save(updatedUser);
      const userDto = this.userMapper.toDto(savedUser);
      this.eventEmitter.emit(Events.User.UPDATED, new UserUpdatedEvent(userDto.id, userDto.username));
      this.logger.log(`updateUser() - success | userId=${userDto.id}, username=${userDto.username}`);
      return userDto;
    } catch (error) {
      this.logger.error(`updateUser() - error | userId=${userId}, msg=${error.message}`, error.stack);

      if (error instanceof UserNotFoundException) throw error;

      throw new UserOperationFailedException('updateUser', error.message);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    this.logger.debug(`deleteUser() - start | userId=${userId}`);

    try {
      const user = await this.findUserById(userId);
      await this.usersRepository.remove(user);

      this.eventEmitter.emit(Events.User.DELETED, new UserDeletedEvent(userId));
      this.logger.log(`deleteUser() - success | userId=${userId}, username=${user.username}`);
    } catch (error) {
      this.logger.error(`deleteUser() - error | userId=${userId}, msg=${error.message}`, error.stack);

      if (error instanceof UserNotFoundException) throw error;

      throw new UserOperationFailedException('deleteUser', error.message);
    }
  }

  private async checkExistingUser(username: string): Promise<void> {
    const existingUser = await this.usersRepository.findOne({ where: { username } });

    if (existingUser) {
      this.logger.warn(`checkExistingUser() - conflict | username=${username}`);
      throw new UserAlreadyExistsException(username);
    }
  }

  private async saveUser(userData: Partial<User>): Promise<User> {
    this.logger.debug(`saveUser() - start | username=${userData.username}`);
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);
    this.logger.log(`saveUser() - success | userId=${savedUser.id}, username=${savedUser.username}`);
    return savedUser;
  }

  private async findUserWithAccounts(username: string): Promise<User> {
    this.logger.debug(`findUserWithAccounts() - start | username=${username}`);
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['accounts']
    });

    if (!user) {
      this.logger.warn(`findUserWithAccounts() - not found | username=${username}`);
      throw new InvalidUserCredentialsException(username);
    }

    this.logger.log(`findUserWithAccounts() - success | userId=${user.id}, username=${user.username}`);
    return user;
  }

  private async findUserById(userId: string): Promise<User> {
    this.logger.debug(`findUserById() - start | userId=${userId}`);
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      this.logger.warn(`findUserById() - not found | userId=${userId}`);
      throw new UserNotFoundException(userId);
    }

    this.logger.log(`findUserById() - success | userId=${user.id}, username=${user.username}`);
    return user;
  }

  private generateToken(user: User): string {
    this.logger.debug(`generateToken() - start | userId=${user.id}`);

    try {
      const payload = { username: user.username, sub: user.id };
      const token = this.jwtService.sign(payload);
      this.logger.log(`generateToken() - success | userId=${user.id}`);
      return token;
    } catch (error) {
      this.logger.error(`generateToken() - error | userId=${user.id}, msg=${error.message}`, error.stack);
      throw new UserOperationFailedException('generateToken', error.message);
    }
  }

  private createLoginResponse(user: User, token: string): UserLoginResponseDto {
    this.logger.debug(`createLoginResponse() - start | userId=${user.id}`);
    const response: UserLoginResponseDto = {
      access_token: token,
      accounts:
        user.accounts?.map((account) => ({
          id: account.id,
          name: account.name,
          exchange: account.exchange
        })) ?? []
    };
    this.logger.log(`createLoginResponse() - success | userId=${user.id}, totalAccounts=${response.accounts.length}`);
    return response;
  }
}
