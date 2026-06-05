import { ApiProperty } from '@nestjs/swagger';

class OpponentDto {
  @ApiProperty({ example: 'uuid-123' })
  userId: string;

  @ApiProperty({ example: 'JohnDoe' })
  username: string;

  @ApiProperty({ example: '#FF5733', required: false })
  color?: string;
}

export class BattleHistoryItemDto {
  @ApiProperty({ example: 'uuid-battle-456' })
  id: string;

  @ApiProperty({ type: OpponentDto })
  opponent: OpponentDto;

  @ApiProperty({ enum: ['WIN', 'LOSS', 'DRAW'], example: 'WIN' })
  result: 'WIN' | 'LOSS' | 'DRAW';

  @ApiProperty({ example: '2026-06-05T10:00:00.000Z' })
  startedAt: Date;

  @ApiProperty({ example: '2026-06-05T10:15:00.000Z' })
  endedAt: Date;
}

export class BattleHistoryResponseDto {
  @ApiProperty({ type: [BattleHistoryItemDto] })
  data: BattleHistoryItemDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 0 })
  skip: number;

  @ApiProperty({ example: 20 })
  take: number;
}
