import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThreadsModule } from '../threads/threads.module';
import {
    ClientProxyFactory,
    NatsOptions,
    Transport,
} from '@nestjs/microservices';

@Module({
    imports: [HttpModule, ConfigModule, ThreadsModule],
    controllers: [BoardsController],
    providers: [
        {
            provide: 'BOARDS_SERVICE',
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
    exports: ['BOARDS_SERVICE'],
})
export class BoardsModule {}
