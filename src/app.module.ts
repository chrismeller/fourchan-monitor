import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './boards/boards.module';
import { ThreadsModule } from './threads/threads.module';
import { PostsModule } from './posts/posts.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [BoardsModule, ThreadsModule, PostsModule, DatabaseModule, LoggerModule, ConfigModule,
    ClientsModule.register([
      { name: 'BOARDS_SERVICE', transport: Transport.NATS,
          options: {
            url: 'nats://localhost:4222',
        },
      },
    ]),
    ClientsModule.register([
      { name: 'THREADS_SERVICE', transport: Transport.NATS,
        options: {
          url: 'nats://localhost:4222',
        },
      },
    ]),
    ClientsModule.register([
      { name: 'POSTS_SERVICE', transport: Transport.NATS,
        options: {
          url: 'nats://localhost:4222',
        },
      },
  ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
