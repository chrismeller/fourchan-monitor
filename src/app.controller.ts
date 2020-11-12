import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ok } from 'assert';
import { Observable } from 'rxjs';
import { AppService } from './app.service';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService, @Inject('BOARDS_SERVICE') private readonly client: ClientProxy) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @Get('hello')
  async getHello(): Promise<string> {
    // return this.appService.getHello();
    await this.client.send('boards.get', {}).toPromise();
    return 'ok'
  }
}