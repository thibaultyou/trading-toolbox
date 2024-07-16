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

import { Events } from '@config/events.config';

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

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createUser(registerDto: UserCreateRequestDto): Promise<UserDto> {
    this.logger.debug(`Creating new user - Username: ${registerDto.username}`);

    try {
      await this.checkExistingUser(registerDto.username);
      const hashedPassword = await this.passwordService.hashPassword(registerDto.password);
      const user = await this.saveUser({ username: registerDto.username, password: hashedPassword });
      const userDto = this.mapToUserDto(user);
      this.eventEmitter.emit(Events.USER_CREATED, new UserCreatedEvent(userDto.id, userDto.username));
      return userDto;
    } catch (error) {
      this.handleError(error, `Error creating user - Username: ${registerDto.username}`);
    }
  }

  async authenticateUser(loginDto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    this.logger.debug(`Authenticating user - Username: ${loginDto.username}`);

    try {
      const user = await this.findUserWithAccounts(loginDto.username);
      await this.verifyPassword(loginDto.password, user.password);

      const token = this.generateToken(user);
      const response = this.createLoginResponse(user, token);
      this.logger.log(`User authenticated successfully - UserID: ${user.id}, Username: ${user.username}`);
      return response;
    } catch (error) {
      this.handleError(error, `Error authenticating user - Username: ${loginDto.username}`);
    }
  }

  async getUserById(userId: string): Promise<UserDto> {
    this.logger.debug(`Fetching user - UserID: ${userId}`);

    try {
      const user = await this.findUserById(userId);
      return this.mapToUserDto(user);
    } catch (error) {
      this.handleError(error, `Error fetching user - UserID: ${userId}`);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    this.logger.debug(`Deleting user - UserID: ${userId}`);

    try {
      const user = await this.findUserById(userId);
      await this.usersRepository.remove(user);
      this.eventEmitter.emit(Events.USER_DELETED, new UserDeletedEvent(userId));
      this.logger.log(`Deleted user - UserID: ${userId}, Username: ${user.username}`);
    } catch (error) {
      this.handleError(error, `Error deleting user - UserID: ${userId}`);
    }
  }

  async updateUser(userId: string, updateData: UserUpdateRequestDto): Promise<UserDto> {
    this.logger.debug(`Updating user - UserID: ${userId}`);

    try {
      const user = await this.findUserById(userId);
      const updatedUser = await this.updateUserData(user, updateData);
      const userDto = this.mapToUserDto(updatedUser);
      this.eventEmitter.emit(Events.USER_UPDATED, new UserUpdatedEvent(userDto.id, userDto.username));
      return userDto;
    } catch (error) {
      this.handleError(error, `Error updating user - UserID: ${userId}`);
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

  private async updateUserData(user: User, updateData: UserUpdateRequestDto): Promise<User> {
    if (updateData.password) {
      updateData.password = await this.passwordService.hashPassword(updateData.password);
    }

    Object.assign(user, updateData);
    const updatedUser = await this.usersRepository.save(user);
    this.logger.log(`Updated user - UserID: ${user.id}, Username: ${updatedUser.username}`);
    return updatedUser;
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

  private mapToUserDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username
    };
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
