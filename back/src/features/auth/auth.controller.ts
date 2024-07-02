import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { LoginResponseDto } from './dtos/login.response.dto';
import { RegisterDto } from './dtos/register.dto';
import { UserDto } from './dtos/user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Create a new user account' })
  @ApiBody({ type: RegisterDto, description: 'User registration details' })
  @ApiCreatedResponse({ description: 'The registered user', type: UserDto })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input' })
  async register(@Body() registerDto: RegisterDto): Promise<UserDto> {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in a user', description: 'Authenticate a user and receive a JWT token' })
  @ApiBody({ type: LoginDto, description: 'User login credentials' })
  @ApiResponse({ status: 200, description: 'Successful login', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }
}
