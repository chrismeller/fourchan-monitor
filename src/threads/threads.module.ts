import { Module } from '@nestjs/common';
import { ThreadsController } from './threads.controller';
import { ThreadsService } from './threads.service';
import {
    ClientProxyFactory,
    Transport,
} from '@nestjs/microservices';
import { DatabaseModule } from '../database/database.module';
import { HttpModule } from '@nestjs/axios';
import { PostsModule } from '../posts/posts.module';
import { ConfigService } from '@nestjs/config';
import { NatsOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface';

@Module({
    imports: [HttpModule, DatabaseModule, PostsModule],
    controllers: [ThreadsController],
    providers: [
        ThreadsService,
        {
            provide: 'THREADS_SERVICE',
            useFactory: (configService: ConfigService) => {
                const natsUrl = configService.get<string>('NATS_URL');
                return ClientProxyFactory.create({
                    transport: Transport.NATS,
                    options: {
                        servers: [natsUrl],
                    },
                } as NatsOptions);
            },
            inject: [ConfigService],
        },
    ],
    exports: [ThreadsService, 'THREADS_SERVICE'],
})
export class ThreadsModule {}
