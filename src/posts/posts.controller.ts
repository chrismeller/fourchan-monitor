import { Controller, HttpService } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, NatsContext } from '@nestjs/microservices';
import { GetThreadPosts } from './messages/get-thread-posts.command';
import { PostsService } from './posts.service';
import { PostEntity } from './entities/post.entity';
import { Post, PostsWrapper } from './dtos/post.dto';
import { ThreadEntity } from '../threads/entities/thread.entity';
import { ThreadsService } from '../threads/threads.service';

@Controller('posts')
export class PostsController {
    constructor(private readonly httpService: HttpService,
                private readonly postsService: PostsService,
                private readonly threadsService: ThreadsService) {}

    @MessagePattern('posts.get')
    async getPosts(@Payload() threadToRun: GetThreadPosts, @Ctx() context: NatsContext): Promise<void> {
        console.log(`posts.get started for ${threadToRun.board}: ${threadToRun.no}`, new Date().toISOString());

        // we get the existing thread here to make sure that we have the correct headers to use, if we've gotten this thread before
        // this should really go into the thread controller and be handed to us, but we don't use it elsewhere there
        const existing = await this.threadsService.get(threadToRun.board, threadToRun.no);

        // if there was an existing item, check its time and etag
        if (existing) {
            try {
                // do a head request to see if it has been modified since
                const responseObservable = this.httpService.head(`https://a.4cdn.org/${threadToRun.board}/thread/${threadToRun.no}.json`, {
                    headers: {
                        'If-Modified-Since': new Date(existing.Meta.LastModified * 1000),
                        'Etag': existing.Meta.ETag,
                    },
                });
                const response = await responseObservable.toPromise();

                // if it hasn't been modified, nothing to do
                if (response.status == 304) {
                    return;
                }
            }
            catch (e) {
                console.error('Unable to get thread at HEAD request!');
                return;
            }
        }

        // now we know it either doesn't exist already, or it has been modified - time to update
        let rawPosts: PostsWrapper = null;
        try {
            const responseObservable = this.httpService.get<PostsWrapper>(`https://a.4cdn.org/${threadToRun.board}/thread/${threadToRun.no}.json`);
            const response = await responseObservable.toPromise();

            // first, create the thread entity
            const newEntity: ThreadEntity = {
                Meta: {
                    LastModified: threadToRun.last_modified,
                    ETag: response.headers['etag']
                },
                Board: threadToRun.board,
                Number: threadToRun.no,
            };

            // and time to save it
            await this.threadsService.upsert(newEntity);

            rawPosts = response.data;
        }
        catch (e) {
            console.error('Unable to get thread at GET request!');
            return;
        }

        if (rawPosts != null) {
            for (const rawPost of rawPosts.posts) {
                const post: PostEntity = {
                    Board: threadToRun.board,
                    Thread: threadToRun.no,
                    Comment: rawPost.com,
                    FileExtension: rawPost.ext,
                    Filename: rawPost.filename,
                    FileSize: rawPost.fsize,
                    FileHeight: rawPost.h,
                    FileHash: rawPost.md5,
                    PostersName: rawPost.name,
                    Number: rawPost.no,
                    UrlSlug: rawPost.semantic_url,
                    FileUploaded: (rawPost.tim != null) ? new Date(rawPost.tim) : null,
                    CreatedAt: new Date(rawPost.time * 1000),
                    FileWidth: rawPost.w,
                };

                console.log(`Putting post ${post.Board}: ${post.Number}`);
                await this.postsService.put(post);
            }
        }
    }
}
