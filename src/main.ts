import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      url: 'nats://localhost:4222',
    },
  });

  app.useLogger(await app.resolve('LoggerService'));

  await app.startAllMicroservicesAsync();
  await app.listen(3000, () => console.log('Listening on port 3000!'));

  // const microservices = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  //   transport: Transport.NATS,
  //   options: {
  //     url: 'nats://localhost:4222',
  //   },
  // });
  // microservices.listen(() => console.log('Microservice is listening.'));
}
bootstrap();
