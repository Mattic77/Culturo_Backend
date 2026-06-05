import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UpdateUserDto,
  UpdateCountryPreferenceDto,
} from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Usertype } from '@prisma/client';
import {
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiOkResponse({ description: 'List of users retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  getAllUsers(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.userService.getAllUsers(+(skip || 0), +(take || 10));
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @Get('admin/stats')
  @ApiOperation({ summary: 'Get user platform statistics (Admin only)' })
  @ApiOkResponse({ description: 'Statistics retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  getAdminStats() {
    return this.userService.getAdminStats();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Usertype.admin)
  @ApiBearerAuth()
  @Patch('admin/user-type/:id')
  @ApiOperation({ summary: 'Update user type/role (Admin only)' })
  @ApiOkResponse({ description: 'User type updated successfully.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Admin role required.' })
  updateUserType(
    @Param('id') id: string,
    @Body('userType') userType: Usertype,
  ) {
    return this.userService.updateUserType(id, userType);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('getme')
  @ApiOperation({ summary: 'Get Current User Profile' })
  @ApiOkResponse({ description: 'Profile retrieved successfully.' })
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
  @ApiOkResponse({ description: 'Profile updated successfully.' })
  @ApiBadRequestResponse({ description: 'Failed to update profile.' })
  updateUser(
    @Request() req: { user: { id: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(req.user.id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch('updateemail')
  @ApiOperation({ summary: 'Update User Email' })
  @ApiOkResponse({ description: 'Email updated successfully.' })
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
  @ApiOkResponse({ description: 'User deleted successfully.' })
  @ApiBadRequestResponse({ description: 'Failed to delete user.' })
  deleteCurrentUser(@Request() req: { user: { id: string } }) {
    return this.userService.deleteUser(req.user.id);
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Get Public Profile of any User' })
  @ApiOkResponse({ description: 'Public profile retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  getPublicProfile(@Param('id') id: string) {
    return this.userService.getPublicProfile(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch('preferences/country')
  @ApiOperation({ summary: 'Update user country preference' })
  @ApiOkResponse({ description: 'Preference updated successfully.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiBadRequestResponse({ description: 'Failed to update preference.' })
  updateCountryPreference(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateCountryPreferenceDto,
  ) {
    return this.userService.updateCountryPreference(req.user.id, dto.countryId);
  }
}
