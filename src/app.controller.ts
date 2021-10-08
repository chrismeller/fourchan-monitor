import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('BOARDS_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get('hello')
  async getHello(): Promise<string> {
    await firstValueFrom(this.client.emit('boards.get', {}));
    return 'ok';
  }
}
