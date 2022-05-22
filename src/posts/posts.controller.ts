import { Controller, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { PostsService } from './posts.service';
import { firstValueFrom } from 'rxjs';
import { PostsWrapper } from './dtos/post.dto';
import { ThreadsService } from '../threads/threads.service';
import { ThreadEntity } from '../threads/entities/thread.entity';
import { PostEntity } from './entities/post.entity';
import { FixPostDates } from './messages/fix-post-dates.command';

@Controller('posts')
export class PostsController {
    private readonly logger = new Logger(PostsController.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly postsService: PostsService,
        private readonly threadsService: ThreadsService,
        @Inject('POSTS_SERVICE') private readonly postsClient: ClientProxy,
    ) {}

    @EventPattern('posts.fix-dates')
    async fixThreadDates(@Payload('board') board: string) {
        this.logger.debug(`posts.fix-dates started for board ${board}`);

        const batch = this.postsService.getBatchOfInvalidDates();

        this.logger.log(`Got ${batch.length} posts with bad dates to fix.`);

        this.postsService.batchFixDates(batch);

        this.logger.debug(`posts.fix-dates completed for board ${board}`);
    }

    @EventPattern('posts.get')
    async getPosts(
        @Payload('board') board: string,
        @Payload('no') no: number,
    ): Promise<void> {
        this.logger.debug(`posts.get started for ${board}: ${no}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<PostsWrapper>(
                    `https://a.4cdn.org/${board}/thread/${no}.json`,
                ),
            );

            // first, update the thread with the latest headers
            const threadEntity: ThreadEntity = {
                Board: board,
                Number: no,
                Meta: {
                    LastModified: new Date(response.headers['last-modified']),
                    ETag: response.headers['etag'],
                },
            };

            this.threadsService.upsert(threadEntity);

            // now we can save all the posts
            const posts = response.data.posts.map((p) => {
                return {
                    Board: board,
                    Thread: no,
                    Comment: p.com,
                    FileExtension: p.ext,
                    Filename: p.filename,
                    FileSize: p.fsize,
                    FileHeight: p.h,
                    FileHash: p.md5,
                    PostersName: p.name,
                    Number: p.no,
                    UrlSlug: p.semantic_url,
                    FileUploaded: p.tim != null ? new Date(p.tim) : null, // note that this INCLUDES microtime, so we don't multiply
                    CreatedAt: new Date(p.time * 1000),
                    FileWidth: p.w,
                    Replies: p.replies,
                    ImageReplies: p.images,
                    UniqueIps: p.unique_ips,
                } as PostEntity;
            });

            this.logger.debug(
                `Putting batch of ${posts.length} posts for ${board}: ${no}`,
            );

            this.postsService.putBatch(posts);
        } catch (e) {
            this.logger.error(
                `Unable to get ${board}: ${no} at GET request: ${e}`,
            );
            return;
        }

        await firstValueFrom(
            this.postsClient.emit<FixPostDates>('posts.fix-dates', { board: board }),
        );
    }
}
