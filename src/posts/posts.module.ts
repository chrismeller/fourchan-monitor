import { HttpModule, Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { DatabaseModule } from '../database/database.module';
import { PostsService } from './posts.service';
import { ThreadsModule } from '../threads/threads.module';

@Module({
  imports: [HttpModule, DatabaseModule, ThreadsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
