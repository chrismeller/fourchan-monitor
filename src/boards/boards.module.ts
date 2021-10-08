import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ThreadsModule } from '../threads/threads.module';

@Module({
    imports: [HttpModule, ConfigModule, ThreadsModule],
    controllers: [BoardsController],
})
export class BoardsModule {}
