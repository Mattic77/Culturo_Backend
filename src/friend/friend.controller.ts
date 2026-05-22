import { Controller, Get, Post, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { FriendService } from './friend.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
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
  sendRequest(@Request() req: { user: { id: string } }, @Param('id') receiverId: string) {
    return this.friendService.sendFriendRequest(req.user.id, receiverId);
  }

  @Patch('accept/:requestId')
  @ApiOperation({ summary: 'Accept a friend request' })
  @ApiOkResponse({ description: 'Friend request accepted.' })
  acceptRequest(@Request() req: { user: { id: string } }, @Param('requestId') requestId: string) {
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
