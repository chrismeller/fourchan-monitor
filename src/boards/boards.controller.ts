import { Controller, HttpService, Inject } from '@nestjs/common';
import { ClientProxy, Ctx, MessagePattern, NatsContext, Payload } from '@nestjs/microservices';
import { ConfigService } from 'src/config/config.service';
import { BoardsResponseDto } from './dtos/boards-response.dto';

@Controller('boards')
export class BoardsController {
    constructor(private readonly httpService: HttpService, 
        @Inject('THREADS_SERVICE') private readonly threadsClient: ClientProxy,
        private readonly configService: ConfigService) {}

    @MessagePattern('boards.get')
    async getBoards(@Ctx() context: NatsContext): Promise<void> {
        console.log('boards.get started!', new Date().toISOString());

        // const response = await this.httpService.get<BoardsResponseDto>('https://a.4cdn.org/boards.json').toPromise();
    
        // let boardsToRun: Array<string> = [];
        // for (const board of response.data.boards) {
        //     boardsToRun.push(board.board);
        // }
    
        console.log('boards.get completed!', new Date().toISOString());
    
        const boardsToRun = this.configService.get('BOARDS');

        for (const board of boardsToRun.split(',')) {
            console.log(`Sending threads.get for ${board}`);
            await this.threadsClient.send<string>('threads.get', board).toPromise();
        }
    }
}
