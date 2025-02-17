import { Body, Get, Controller, Delete, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Urls } from '@config';

import { UserUpdateRequestDto } from './dtos/user-update.request.dto';
import { UserDto } from './dtos/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserService } from './user.service';
import { ExtractUserId } from '../../common/decorators/user-id-extractor.decorator';

@ApiTags('Users')
@Controller(Urls.USERS)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user', description: "Retrieve the authenticated user's account details" })
  @ApiResponse({ status: 200, description: 'Authenticated user details', type: UserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@ExtractUserId() userId: string): Promise<UserDto> {
    return this.userService.getUserById(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user', description: "Update the authenticated user's account details" })
  @ApiBody({ type: UserUpdateRequestDto, description: 'Updated user details' })
  @ApiResponse({ status: 200, description: 'User successfully updated', type: UserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @ExtractUserId() userId: string,
    @Body() updateData: Partial<UserUpdateRequestDto>
  ): Promise<UserDto> {
    return this.userService.updateUser(userId, updateData);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user', description: "Delete the authenticated user's account" })
  @ApiResponse({ status: 204, description: 'User successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@ExtractUserId() userId: string) {
    await this.userService.deleteUser(userId);
  }
}
