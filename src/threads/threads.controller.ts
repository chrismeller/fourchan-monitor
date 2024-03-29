import { Controller, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
    ClientProxy,
    Ctx,
    EventPattern,
    NatsContext,
    Payload,
} from '@nestjs/microservices';
import { ThreadsService } from './threads.service';
import { firstValueFrom } from 'rxjs';
import { ThreadPageDto } from './dtos/thread-page.dto';
import { Thread } from './entities/thread.entity';
import { GetThreadPosts } from '../posts/messages/get-thread-posts.command';
import { CheckThread } from './messages/check-thread.command';

@Controller('threads')
export class ThreadsController {
    private readonly logger = new Logger(ThreadsController.name);

    constructor(
        private readonly httpService: HttpService,
        @Inject('THREADS_SERVICE') private readonly threadsClient: ClientProxy,
        @Inject('POSTS_SERVICE') private readonly postsClient: ClientProxy,
        private readonly threadsService: ThreadsService,
    ) {}

    @EventPattern('threads.get')
    async getThreadPages(
        @Payload() board: string,
        @Ctx() context: NatsContext,
    ): Promise<void> {
        this.logger.log(`threads.get started for board ${board}`);

        const response = await firstValueFrom(
            this.httpService.get<ThreadPageDto[]>(
                `https://a.4cdn.org/${board}/threads.json`,
            ),
        );

        let threadsFound = 0;
        for (const threadPage of response.data) {
            for (const thread of threadPage.threads) {
                // we only use existing for the etag, if there is one, so it doesn't get wiped out
                // otherwise, we can upsert the whole thing and not care - we have the rest of the info
                const existing = await this.threadsService.get(board, thread.no);

                const dbThread: Thread = {
                    board: board,
                    number: thread.no,
                    lastModified: new Date(thread.last_modified * 1000),
                    etag: existing?.etag,
                };

                this.threadsService.upsert(dbThread);

                await firstValueFrom(
                    this.threadsClient.emit<CheckThread>('threads.check', {
                        board: dbThread.board,
                        no: dbThread.number,
                        last_modified: dbThread.lastModified,
                        etag: dbThread.etag,
                    }),
                );

                threadsFound++;
            }
        }

        this.logger.debug(
            `threads.get got ${threadsFound} threads for board ${board}`,
        );
    }

    @EventPattern('threads.check')
    async checkThreadUpdate(
        @Payload('board') board: string,
        @Payload('no') no: number,
        @Payload('last_modified') last_modified: number,
        @Payload('etag') etag?: string,
    ): Promise<void> {
        this.logger.debug(`threads.check started for ${board}: ${no}`);

        try {
            const headers: any = {
                'If-Modified-Since': last_modified,
            };

            if (etag) {
                headers['Etag'] = etag;
            }

            const response = await firstValueFrom(
                this.httpService.head(
                    `https://a.4cdn.org/${board}/thread/${no}.json`,
                    {
                        headers: headers,
                    },
                ),
            );

            // if it hasn't been modified, nothing else to do
            if (response.status == 304) {
                this.logger.debug(`Not modified response for ${board}: ${no}`);
                return;
            }

            // otherwise, we pass it along to fetch
            this.logger.debug(`Sending posts.get for ${board}: ${no}`);
            await firstValueFrom(
                this.postsClient.emit<GetThreadPosts>('posts.get', {
                    board: board,
                    no: no,
                }),
            );
        } catch (e) {
            this.logger.error(
                `Unable to get ${board}: ${no} at HEAD request: ${e}`,
            );
            return;
        }
    }
}
