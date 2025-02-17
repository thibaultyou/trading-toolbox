import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Urls } from '@config';

import { UserCreateRequestDto } from './dtos/user-create.request.dto';
import { UserLoginRequestDto } from './dtos/user-login.request.dto';
import { UserLoginResponseDto } from './dtos/user-login.response.dto';
import { UserDto } from './dtos/user.dto';
import { UserService } from './user.service';

@ApiTags('Authentication')
@Controller(Urls.AUTH)
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post(`register`)
  @ApiOperation({ summary: 'Create a new user', description: 'Create a new user account' })
  @ApiBody({ type: UserCreateRequestDto, description: 'User registration details' })
  @ApiCreatedResponse({ description: 'The created user', type: UserDto })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input' })
  async createUser(@Body() registerDto: UserCreateRequestDto): Promise<UserDto> {
    return this.userService.createUser(registerDto);
  }

  @Post(`login`)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user', description: 'Authenticate a user and receive a JWT token' })
  @ApiBody({ type: UserLoginRequestDto, description: 'User login credentials' })
  @ApiResponse({ status: 200, description: 'Successful authentication', type: UserLoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  async authenticateUser(@Body() loginDto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    return this.userService.authenticateUser(loginDto);
  }
}
