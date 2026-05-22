import { Module } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { BattleGateway } from './battle.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BattleService, BattleGateway],
  controllers: [BattleController],
  exports: [BattleService],
})
export class BattleModule {}
