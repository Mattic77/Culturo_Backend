import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BattleService } from './battle.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { BattleHistoryResponseDto } from './dto/battle-history-response.dto';

@ApiTags('battle')
@Controller('battle')
/**
 * REST endpoints for the Battle module.
 * 
 * 🎮 **WEBSOCKET BATTLE GUIDE (For Mobile Devs)** 🎮
 * Battles are played in real-time via WebSockets. Connect to the `/battle` namespace with query param `?userId=your-uuid`.
 * 
 * **1. Matchmaking:**
 * - `emit('join_queue', { username: 'John' })`: Join matchmaking.
 * - `listen('queue_joined')`: Acknowledges entry.
 * - `listen('match_found')`: Received when matched. Contains `roomId`.
 * - `listen('battle_started')`: Fired 3s after match found.
 * 
 * **2. Playing:**
 * - `listen('new_question')`: Receives question (without answer) + current index.
 * - `emit('submit_answer', { roomId: '...', answer: 'Paris' })`: Send your answer.
 * - `listen('answer_result')`: Immediate feedback (Correct?, points earned).
 * - `listen('round_ended')`: Sent when both players answer. Contains true answer & intermediate scores.
 * 
 * **3. Chat (Optional):**
 * - `emit('send_battle_message', { roomId, message })`: Send a chat message.
 * - `listen('new_battle_message')`: Receive messages from opponent.
 * 
 * **4. Finish:**
 * - `listen('battle_finished')`: Receives final winner and XP updates.
 */
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('history/me')
  @ApiOperation({ summary: 'Get current user battle history' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiOkResponse({ 
    description: 'Battle history retrieved successfully.',
    type: BattleHistoryResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid pagination parameters.' })
  getBattleHistory(
    @Request() req: { user: { id: string } },
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.battleService.getBattleHistory(
      req.user.id,
      +(skip || 0),
      +(take || 20),
    );
  }
}
