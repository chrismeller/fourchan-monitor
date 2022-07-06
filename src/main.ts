import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClientProxy, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { LogLevel } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    const logLevels = configService.get<string>('LOG_LEVELS', 'error,warn');
    app.useLogger(logLevels.split(',') as LogLevel[]);

    app.connectMicroservice({
        transport: Transport.NATS,
        options: {
            servers: [configService.get<string>('NATS_URL')],
        },
    });

    app.enableShutdownHooks();

    await app.init();
    await app.startAllMicroservices();
    await app.listen(3000);

    const boardsService = app.get<ClientProxy>('BOARDS_SERVICE');
    boardsService.emit('boards.get', {});
}
bootstrap();
