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
import { ThreadEntity } from './entities/thread.entity';
import { GetThreadPosts } from '../posts/messages/get-thread-posts.command';
import { CheckThread } from './messages/check-thread.command';
import { FixThreadDates } from './messages/fix-thread-dates.command';

@Controller('threads')
export class ThreadsController {
    private readonly logger = new Logger(ThreadsController.name);

    constructor(
        private readonly httpService: HttpService,
        @Inject('THREADS_SERVICE') private readonly threadsClient: ClientProxy,
        @Inject('POSTS_SERVICE') private readonly postsClient: ClientProxy,
        private readonly threadsService: ThreadsService,
    ) {}

    @EventPattern('threads.fix-dates')
    async fixThreadDates(@Payload('board') board: string) {
        this.logger.debug(`threads.fix-dates started for board ${board}`);

        const batch = this.threadsService.getBatchOfInvalidDates(board);

        this.logger.log(`Got ${batch.length} threads with bad dates to fix.`);

        this.threadsService.batchFixDates(batch);

        this.logger.debug(`threads.fix-dates completed for board ${board}`);
    }

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
                const existing = this.threadsService.get(board, thread.no);

                const dbThread: ThreadEntity = {
                    Board: board,
                    Number: thread.no,
                    Meta: {
                        LastModified: new Date(thread.last_modified * 1000),
                        ETag: existing?.Meta.ETag,
                    },
                };

                this.threadsService.upsert(dbThread);

                await firstValueFrom(
                    this.threadsClient.emit<CheckThread>('threads.check', {
                        board: dbThread.Board,
                        no: dbThread.Number,
                        last_modified: dbThread.Meta.LastModified,
                        etag: dbThread.Meta.ETag,
                    }),
                );

                threadsFound++;
            }
        }

        this.logger.debug(
            `threads.get got ${threadsFound} threads for board ${board}`,
        );

        await firstValueFrom(
            this.threadsClient.emit<FixThreadDates>('threads.fix-dates', { board: board }),
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
