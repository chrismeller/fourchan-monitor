import { EntityRepository, MikroORM, UseRequestContext } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
    private readonly logger = new Logger(PostsService.name);

    constructor(
        private readonly orm: MikroORM,
        @InjectRepository(Post)
        private readonly postRepository: EntityRepository<Post>,
    ) {}

    @UseRequestContext()
    public async putBatch(posts: Post[]): Promise<void> {
        await this.orm.em.transactional(async em => {
            for (const post of posts) {
                const existing = await this.postRepository.findOne({
                    board: post.board,
                    thread: post.thread,
                    number: post.number,
                });

                if (existing) {
                    existing.replies = post.replies;
                    existing.imageReplies = post.imageReplies;
                    existing.uniqueIps = post.uniqueIps;

                    this.postRepository.persist(existing);
                }
                else {
                    const dbPost = this.postRepository.create(post);
                    this.postRepository.persist(dbPost);
                }
            }
        });
    }
}
