import { Module } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { BattleGateway } from './battle.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendModule } from '../friend/friend.module';

@Module({
  imports: [PrismaModule, FriendModule],
  providers: [BattleService, BattleGateway],
  controllers: [BattleController],
  exports: [BattleService],
})
export class BattleModule {}
