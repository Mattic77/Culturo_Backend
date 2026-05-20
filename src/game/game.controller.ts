import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { GameService } from './game.service';
import { StartGameDto } from './dto/start-game.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { CompleteGameDto } from './dto/complete-game.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('game')
@Controller('game')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('session/start')
  @ApiOperation({ summary: 'Start a secure game session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns sessionId and first question',
  })
  startSession(@Req() req: any, @Body() startGameDto: StartGameDto) {
    return this.gameService.startSession(req.user.id, startGameDto);
  }

  @Post('session/answer')
  @ApiOperation({ summary: 'Submit an answer and get immediate feedback' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns correctness and next question',
  })
  submitAnswer(@Req() req: any, @Body() submitAnswerDto: SubmitAnswerDto) {
    return this.gameService.submitAnswer(req.user.id, submitAnswerDto);
  }

  @Post('session/complete')
  @ApiOperation({ summary: 'Complete a game session and earn XP' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns final score and XP status',
  })
  completeSession(@Req() req: any, @Body() completeGameDto: CompleteGameDto) {
    return this.gameService.completeSession(req.user.id, completeGameDto.sessionId);
  }
}
