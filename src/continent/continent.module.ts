import { Module } from '@nestjs/common';
import { ContinentService } from './continent.service';
import { ContinentController } from './continent.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ContinentController],
  providers: [ContinentService],
  exports: [ContinentService],
})
export class ContinentModule {}
