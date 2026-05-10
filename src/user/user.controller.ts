import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('getme')
  @ApiOperation({ summary: 'Get Current User Profile' })
  @ApiCreatedResponse({ description: 'Profile retrieved successfully.' })
  getCurrentUser(@Request() req: { user: { id: string } }) {
    return this.userService.findById(req.user.id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch('updateme')
  @ApiOperation({
    summary: 'Update Current User Profile',
    description:
      'Update username, email, dateOfBirth or any combination of these fields.',
  })
  @ApiCreatedResponse({ description: 'Profile updated successfully.' })
  @ApiBadRequestResponse({ description: 'Failed to update profile.' })
  updateUser(
    @Request() req: { user: { id: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(req.user.id, updateUserDto);
  }
  @Patch('updateemail')
  @ApiOperation({ summary: 'Update User Email' })
  @ApiCreatedResponse({ description: 'Email updated successfully.' })
  @ApiBadRequestResponse({ description: 'Failed to update email.' })
  updateEmail(
    @Request()
    req: {
      user: { id: string };
    },
    @Body('email') newEmail: string,
    @Body('code') code: number,
  ) {
    return this.userService.updateemail(req.user.id, newEmail, code);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete('deleteme')
  @ApiOperation({ summary: 'Delete Current User Account' })
  @ApiCreatedResponse({ description: 'User deleted successfully.' })
  @ApiBadRequestResponse({ description: 'Failed to delete user.' })
  deleteCurrentUser(@Request() req: { user: { id: string } }) {
    return this.userService.deleteUser(req.user.id);
  }
}
