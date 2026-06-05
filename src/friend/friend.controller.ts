import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('friends')
@Controller('friends')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('request/:id')
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiCreatedResponse({ description: 'Friend request sent successfully.' })
  @ApiBadRequestResponse({
    description: 'Cannot send request to yourself or already friends.',
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  sendRequest(
    @Request() req: { user: { id: string } },
    @Param('id') receiverId: string,
  ) {
    return this.friendService.sendFriendRequest(req.user.id, receiverId);
  }

  @Patch('accept/:requestId')
  @ApiOperation({ summary: 'Accept a friend request' })
  @ApiOkResponse({ description: 'Friend request accepted.' })
  @ApiBadRequestResponse({ description: 'Invalid request or already friends.' })
  @ApiNotFoundResponse({ description: 'Friend request not found.' })
  acceptRequest(
    @Request() req: { user: { id: string } },
    @Param('requestId') requestId: string,
  ) {
    return this.friendService.acceptFriendRequest(req.user.id, requestId);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get list of friends' })
  @ApiOkResponse({ description: 'List of friends retrieved successfully.' })
  getFriends(@Request() req: { user: { id: string } }) {
    return this.friendService.getFriendsList(req.user.id);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending friend requests' })
  @ApiOkResponse({ description: 'Pending requests retrieved successfully.' })
  getPending(@Request() req: { user: { id: string } }) {
    return this.friendService.getPendingRequests(req.user.id);
  }
}
