import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';

import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UserDto } from './dtos/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<UserDto> {
    try {
      this.logger.debug(`Registering new user - Username: ${registerDto.username}`);
      const hashedPassword = await argon2.hash(registerDto.password);
      const user = this.usersRepository.create({
        username: registerDto.username,
        password: hashedPassword
      });
      const savedUser = await this.usersRepository.save(user);
      this.logger.log(`User registered successfully - UserID: ${savedUser.id}`);
      return {
        id: savedUser.id,
        username: savedUser.username
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    this.logger.debug(`Login attempt - Username: ${loginDto.username}`);
    const user = await this.usersRepository.findOne({ where: { username: loginDto.username } });

    if (user && (await argon2.verify(user.password, loginDto.password))) {
      const payload = { username: user.username, sub: user.id };
      const token = this.jwtService.sign(payload);
      this.logger.log(`User logged in successfully - UserID: ${user.id}, Name: ${user.username}`);
      return { access_token: token };
    }

    this.logger.warn(`Login failed - Username: ${loginDto.username}`);
    throw new UnauthorizedException('Invalid credentials');
  }

  async validateUserById(userId: string): Promise<User> {
    this.logger.debug(`Validating user - UserID: ${userId}`);
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      this.logger.warn(`User validation failed - UserID: ${userId}`);
      throw new UnauthorizedException('User not found');
    }

    this.logger.debug(`User validated successfully - UserID: ${userId}`);
    return user;
  }

  async getUserById(userId: string): Promise<User> {
    this.logger.debug(`Fetching user - UserID: ${userId}`);
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      this.logger.warn(`User not found - UserID: ${userId}`);
      throw new UnauthorizedException('User not found');
    }

    this.logger.debug(`User fetched successfully - UserID: ${userId}`);
    return user;
  }
}
