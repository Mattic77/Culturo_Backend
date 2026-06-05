import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RagTaskService } from './rag-task.service';

@Module({
  imports: [PrismaModule],
  providers: [RagService, RagTaskService],
  exports: [RagService],
})
export class RagModule {}
