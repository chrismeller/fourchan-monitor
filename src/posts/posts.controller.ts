import { Controller, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PostsService } from './posts.service';
import { firstValueFrom } from 'rxjs';
import { PostsWrapper } from './dtos/post.dto';
import { ThreadsService } from '../threads/threads.service';
import { Thread } from 'src/threads/entities/thread.entity';
import { Post } from './entities/post.entity';

@Controller('posts')
export class PostsController {
    private readonly logger = new Logger(PostsController.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly postsService: PostsService,
        private readonly threadsService: ThreadsService,
    ) {}

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
            const threadEntity: Thread = {
                board: board,
                number: no,
                lastModified: new Date(response.headers['last-modified']),
                etag: response.headers['etag'],
            };

            await this.threadsService.upsert(threadEntity);

            // now we can save all the posts
            const posts = response.data.posts.map((p) => {
                return {
                    board: board,
                    thread: no,
                    comment: p.com,
                    fileExtension: p.ext,
                    filename: p.filename,
                    fileSize: p.fsize,
                    fileHeight: p.h,
                    fileHash: p.md5,
                    postersName: p.name,
                    number: p.no,
                    urlSlug: p.semantic_url,
                    fileUploaded: p.tim != null ? new Date(p.tim) : null, // note that this INCLUDES microtime, so we don't multiply
                    createdAt: new Date(p.time * 1000),
                    fileWidth: p.w,
                    replies: p.replies,
                    imageReplies: p.images,
                    uniqueIps: p.unique_ips,
                } as Post;
            });

            this.logger.debug(
                `Putting batch of ${posts.length} posts for ${board}: ${no}`,
            );

            await this.postsService.putBatch(posts);
        } catch (e) {
            this.logger.error(
                `Unable to get ${board}: ${no} at GET request: ${e}`,
            );
            return;
        }
    }
}
