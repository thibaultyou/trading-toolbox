import { Body, Controller, Delete, HttpCode, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Urls } from '@config';

import { UserCreateRequestDto } from './dtos/user-create.request.dto';
import { UserLoginRequestDto } from './dtos/user-login.request.dto';
import { UserLoginResponseDto } from './dtos/user-login.response.dto';
import { UserDto } from './dtos/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserService } from './user.service';
import { ExtractUserId } from '../../common/decorators/user-id-extractor.decorator';

@ApiTags('User authentication')
@Controller(Urls.USERS)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a new user', description: 'Create a new user account' })
  @ApiBody({ type: UserCreateRequestDto, description: 'User registration details' })
  @ApiCreatedResponse({ description: 'The created user', type: UserDto })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input' })
  async createUser(@Body() registerDto: UserCreateRequestDto): Promise<UserDto> {
    return this.userService.createUser(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user', description: 'Authenticate a user and receive a JWT token' })
  @ApiBody({ type: UserLoginRequestDto, description: 'User login credentials' })
  @ApiResponse({ status: 200, description: 'Successful authentication', type: UserLoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  async authenticateUser(@Body() loginDto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    return this.userService.authenticateUser(loginDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user', description: "Update the authenticated user's account details" })
  @ApiBody({ type: UserLoginRequestDto, description: 'Updated user details' })
  @ApiResponse({ status: 200, description: 'User successfully updated', type: UserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @ExtractUserId() userId: string,
    @Body() updateData: Partial<UserLoginRequestDto>
  ): Promise<UserDto> {
    return this.userService.updateUser(userId, updateData);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user', description: "Delete the authenticated user's account" })
  @ApiResponse({ status: 204, description: 'User successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@ExtractUserId() userId: string) {
    await this.userService.deleteUser(userId);
  }
}
