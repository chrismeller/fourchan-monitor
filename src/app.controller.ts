import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ok } from 'assert';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
import { SQLiteProvider } from './database/sqlite.provider';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService, 
    @Inject('BOARDS_SERVICE') private readonly client: ClientProxy,
    private readonly sqlite: SQLiteProvider) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @Get('info')
  async getInfo(): Promise<object> {
    const db = this.sqlite.get();
    const journalMode = db.pragma('journal_mode');
    const synchronous = db.pragma('synchronous');
    const mmapSize = db.pragma('mmap_size');
    const tempStore = db.pragma('temp_store');

    const threadsCount = db.prepare('select count(*) from threads').pluck().get();
    const postsCount = db.prepare('select count(*) from posts').pluck().get();
    const threadsByBoard = db.prepare('select board, count(*) from threads group by board').all();
    const postsByBoard = db.prepare('select board, count(*) from posts group by board').all();

    return {
      pragma: {
        'journal_mode': journalMode,
        'synchronous': synchronous,
        'mmap_size': mmapSize,
        'temp_store': tempStore,
      },
      'num_threads': threadsCount,
      'num_posts': postsCount,
      'threads_by_board': threadsByBoard,
      'posts_by_board': postsByBoard,
    };
  }

  @Get('hello')
  async getHello(): Promise<string> {
    // return this.appService.getHello();
    await this.client.send('boards.get', {}).toPromise();
    return 'ok'
  }
}