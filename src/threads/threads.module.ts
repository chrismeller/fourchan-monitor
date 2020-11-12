import { HttpModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThreadsController } from './threads.controller';
import { ThreadsService } from './threads.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ HttpModule, DatabaseModule,
    ClientsModule.register([
        { name: 'POSTS_SERVICE', transport: Transport.NATS,
          options: {
            url: 'nats://localhost:4222',
          },
        },
    ]),
],
  controllers: [ThreadsController],
  providers: [ThreadsService],
  exports: [ThreadsService],
})
export class ThreadsModule {}
