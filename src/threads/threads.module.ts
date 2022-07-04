import { forwardRef, Module } from '@nestjs/common';
import { ThreadsController } from './threads.controller';
import { ThreadsService } from './threads.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '../database/database.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NatsOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface';
import { PostsModule } from 'src/posts/posts.module';
import { Thread } from './entities/thread.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
    imports: [
        HttpModule,
        DatabaseModule,
        ConfigModule,
        forwardRef(() => PostsModule),
        MikroOrmModule.forFeature([Thread]),
    ],
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
