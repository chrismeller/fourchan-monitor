import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { LogLevel } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configSerivce = app.get(ConfigService);

    const logLevels = configSerivce.get<LogLevel[]>('LOG_LEVELS', [
        'error',
        'warn',
    ]);
    app.useLogger(logLevels);

    app.connectMicroservice({
        transport: Transport.NATS,
        options: {
            servers: [configSerivce.get<string>('NATS_URL')],
        },
    });

    await app.init();
    await app.startAllMicroservices();
    await app.listen(3000);
}
bootstrap();
