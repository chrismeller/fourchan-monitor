import { Controller, HttpService, Inject } from '@nestjs/common';
import { ClientProxy, Ctx, MessagePattern, NatsContext, Payload } from '@nestjs/microservices';
import { GetThreadPosts } from '../posts/messages/get-thread-posts.command';
import { ThreadPageDto } from './dtos/thread-page.dto';
import { ThreadsService } from './threads.service';
import { ThreadEntity } from './entities/thread.entity';

@Controller('threads')
export class ThreadsController {
	constructor(private readonly httpService: HttpService,
	            @Inject('POSTS_SERVICE') private readonly postsClient: ClientProxy,
	            private readonly threadsService: ThreadsService) {}

	@MessagePattern('threads.get')
	async getThreadPages(@Payload() board: string, @Ctx() context: NatsContext): Promise<void> {
		console.log(`threads.get started for ${board}`, new Date().toISOString());

		const response = await this.httpService.get<Array<ThreadPageDto>>('https://a.4cdn.org/' + board + '/threads.json').toPromise();

		const threads: Array<GetThreadPosts> = [];
		for(const threadPage of response.data) {
			for(const thread of threadPage.threads) {
				// the command
				const t: GetThreadPosts = {
					board: board,
					no: thread.no,
					last_modified: thread.last_modified
				};

				threads.push(t);

				// we only use existing for the etag, if there is one, so it doesn't get wiped out
				// otherwise, we can upsert the whole thing and not care - we have the rest of the info
				const existing = this.threadsService.get(board, thread.no);

				if (existing == null) {
					continue;
				}

				// and now the database entry
				const dbThread: ThreadEntity = {
					Board: board,
					Number: thread.no,
					Meta: {
						LastModified: thread.last_modified,
						ETag: existing.Meta.ETag,
					},
				};

				await this.threadsService.upsert(dbThread);
			}
		}

		console.log(`threads.get got ${threads.length} threads for board ${board}`);
		console.log('threads.get completed!', new Date().toISOString());

		for (const thread of threads) {
			console.log(`Sending posts.get for ${thread.board}: ${thread.no}`);
			await this.postsClient.send<GetThreadPosts>('posts.get', thread).toPromise();
		}
	}
}
