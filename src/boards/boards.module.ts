import { Module, HttpModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '../config/config.module';
import { BoardsController } from './boards.controller';

@Module({
    imports: [ HttpModule, ConfigModule,
        ClientsModule.register([
            { name: 'THREADS_SERVICE', transport: Transport.NATS,
                options: {
                    url: 'nats://localhost:4222',
                },
            },
        ]),
    ],
    controllers: [BoardsController]
})
export class BoardsModule {}
