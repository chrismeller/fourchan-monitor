import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DatabaseModule } from '../database/database.module';
import { HttpModule } from '@nestjs/axios';
import { ThreadsModule } from '../threads/threads.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { NatsOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface';

@Module({
    imports: [HttpModule, ConfigModule, DatabaseModule, ThreadsModule],
    controllers: [PostsController],
    providers: [
        PostsService,
        {
            provide: 'POSTS_SERVICE',
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
    exports: ['POSTS_SERVICE'],
})
export class PostsModule {}
