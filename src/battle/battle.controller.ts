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
 * ---
 * 🎮 **COMPLETE WEBSOCKET BATTLE WORKFLOW (For Mobile Devs)** 🎮
 * 
 * Battles are real-time duels. All communication happens via the `/battle` namespace.
 * 
 * ### 1. Connection 🔌
 * **Namespace:** `/battle`
 * **Required Query Param:** `userId` (The UUID of the authenticated user)
 * **Example:** `ws://api-url/battle?userId=123-abc`
 * 
 * ### 2. Matchmaking Phase 🤝
 * 1. **Client emits `join_queue`**: `{ "username": "YourName" }`
 * 2. **Server emits `queue_joined`**: Confirms you are in line.
 * 3. **Server emits `match_found`**: 
 *    ```json
 *    { "battleId": "...", "roomId": "...", "players": [{ "userId", "username" }, ...] }
 *    ```
 *    *Note: The UI should show a countdown now (3 seconds).*
 * 
 * ### 3. Gameplay Loop (15 Rounds) 🎮
 * 1. **Server emits `new_question`**: 
 *    ```json
 *    { "question": { "id", "question", "suggestedAnswer": { "options" } }, "questionNumber": 1, "totalQuestions": 15 }
 *    ```
 * 2. **Client emits `submit_answer`**: `{ "roomId": "...", "answer": "Paris" }`
 * 3. **Server emits `answer_result`**: Immediate personal feedback (`isCorrect`, `points`).
 * 4. **Server emits `round_ended`**: Both players finished. Contains `scores` array and the `correctAnswer`.
 * 
 * ### 4. Battle Finish 🏁
 * 1. **Server emits `battle_finished`**:
 *    ```json
 *    { "winnerId": "...", "finalScores": [{ "userId", "username", "score" }, ...] }
 *    ```
 *    *Note: XP and levels are updated automatically in the DB by the server.*
 * 
 * ### 5. Social & Extras 💬
 * - **Chat:** Emit `send_battle_message` (`roomId`, `message`) ➔ Listen for `new_battle_message`.
 * - **Invites:** Emit `send_invite` (`receiverId`, `senderUsername`) ➔ Target receives `invite_received`.
 * ---
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
