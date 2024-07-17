import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException
} from '@nestjs/common';
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
    this.logger.debug(`Creating new user - Username: ${dto.username}`);

    try {
      await this.checkExistingUser(dto.username);
      const hashedPassword = await this.passwordService.hashPassword(dto.password);
      const userData = this.userMapper.fromCreateDto(dto);
      const user = await this.saveUser({ ...userData, password: hashedPassword });
      const userDto = this.userMapper.toDto(user);
      this.eventEmitter.emit(Events.User.CREATED, new UserCreatedEvent(userDto.id, userDto.username));
      return userDto;
    } catch (error) {
      this.handleError(error, `Error creating user - Username: ${dto.username}`);
    }
  }

  async authenticateUser(dto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    this.logger.debug(`Authenticating user - Username: ${dto.username}`);

    try {
      const user = await this.findUserWithAccounts(dto.username);
      await this.verifyPassword(dto.password, user.password);

      const token = this.generateToken(user);
      const response = this.createLoginResponse(user, token);
      this.logger.log(`User authenticated successfully - UserID: ${user.id}, Username: ${user.username}`);
      return response;
    } catch (error) {
      this.handleError(error, `Error authenticating user - Username: ${dto.username}`);
    }
  }

  async getUserById(userId: string): Promise<UserDto> {
    this.logger.debug(`Fetching user - UserID: ${userId}`);

    try {
      const user = await this.findUserById(userId);
      return this.userMapper.toDto(user);
    } catch (error) {
      this.handleError(error, `Error fetching user - UserID: ${userId}`);
    }
  }

  async updateUser(userId: string, dto: UserUpdateRequestDto): Promise<UserDto> {
    this.logger.debug(`Updating user - UserID: ${userId}`);

    try {
      const user = await this.findUserById(userId);
      const updatedUser = this.userMapper.updateFromDto(user, dto);

      if (dto.password) {
        updatedUser.password = await this.passwordService.hashPassword(dto.password);
      }

      const savedUser = await this.usersRepository.save(updatedUser);
      const userDto = this.userMapper.toDto(savedUser);
      this.eventEmitter.emit(Events.User.UPDATED, new UserUpdatedEvent(userDto.id, userDto.username));
      return userDto;
    } catch (error) {
      this.handleError(error, `Error updating user - UserID: ${userId}`);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    this.logger.debug(`Deleting user - UserID: ${userId}`);

    try {
      const user = await this.findUserById(userId);
      await this.usersRepository.remove(user);
      this.eventEmitter.emit(Events.User.DELETED, new UserDeletedEvent(userId));
      this.logger.log(`Deleted user - UserID: ${userId}, Username: ${user.username}`);
    } catch (error) {
      this.handleError(error, `Error deleting user - UserID: ${userId}`);
    }
  }

  private async checkExistingUser(username: string): Promise<void> {
    const existingUser = await this.usersRepository.findOne({ where: { username } });

    if (existingUser) {
      this.logger.warn(`Attempt to create user with existing username - Username: ${username}`);
      throw new ConflictException('Username already exists');
    }
  }

  private async saveUser(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);
    this.logger.log(`Created new user - UserID: ${savedUser.id}, Username: ${savedUser.username}`);
    return savedUser;
  }

  private async findUserWithAccounts(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['accounts']
    });

    if (!user) {
      this.logger.warn(`Authentication failed - User not found: ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  private async verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<void> {
    const isPasswordValid = await this.passwordService.verifyPassword(plainTextPassword, hashedPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private createLoginResponse(user: User, token: string): UserLoginResponseDto {
    return {
      access_token: token,
      accounts:
        user.accounts?.map((account) => ({
          id: account.id,
          name: account.name,
          exchange: account.exchange
        })) ?? []
    };
  }

  private async findUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      this.logger.warn(`User not found - UserID: ${userId}`);
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private generateToken(user: User): string {
    try {
      const payload = { username: user.username, sub: user.id };
      return this.jwtService.sign(payload);
    } catch (error) {
      this.logger.error(`Error generating token - UserID: ${user.id} - Error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('An error occurred while generating the token');
    }
  }

  private handleError(error: Error, logMessage: string): never {
    this.logger.error(`${logMessage} - Error: ${error.message}`, error.stack);

    if (
      error instanceof NotFoundException ||
      error instanceof UnauthorizedException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
