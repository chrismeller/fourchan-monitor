import { Controller, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
    ClientProxy,
    Ctx,
    EventPattern,
    NatsContext,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { BoardsResponseDto } from './dtos/boards-response.dto';
import { firstValueFrom } from 'rxjs';

@Controller('boards')
export class BoardsController {
    private readonly logger = new Logger(BoardsController.name);

    constructor(
        private readonly httpService: HttpService,
        @Inject('THREADS_SERVICE') private readonly threadsClient: ClientProxy,
        private readonly configService: ConfigService,
    ) {}

    @EventPattern('boards.get')
    async getBoards(@Ctx() context: NatsContext): Promise<void> {
        this.logger.debug('boards.get started');

        // if the list of boards to run is specified, use those, otherwise we pull them all
        let boardsToRun: string[] = [];
        const configBoards = this.configService.get<string>('BOARDS', '');
        if (configBoards != '') {
            boardsToRun = configBoards.split(',');
        } else {
            this.logger.error('Boards to run not configured. Specify a comma-separated list of boards to run in your config!');
            return;

            const ob = this.httpService.get<BoardsResponseDto>(
                'https://a.4cdn.org/boards.json',
            );
            const response = await firstValueFrom(ob);

            boardsToRun = response.data.boards.map((board) => board.board);

            this.logger.log(`Got ${boardsToRun.length} boards to run!`);
        }

        for (const board of boardsToRun) {
            this.logger.log(`Sending threads.get for board ${board}`);
            await firstValueFrom(
                this.threadsClient.emit<string>('threads.get', board),
            );
        }
    }
}
