import { Module, HttpModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BoardsController } from './boards.controller';

@Module({
    imports: [ HttpModule, 
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
