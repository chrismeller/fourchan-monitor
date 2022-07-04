import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import { Thread } from './entities/thread.entity';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';

@Injectable()
export class ThreadsService {
    private readonly logger = new Logger(ThreadsService.name);

    constructor(
        private readonly orm: MikroORM,
        @InjectRepository(Thread)
        private readonly threadRepository: EntityRepository<Thread>) {
    }


    @UseRequestContext()
    public async get(board: string, threadNumber: number): Promise<Thread | null> {
        return this.threadRepository.findOne({
            board: board,
            number: threadNumber,
        });
    }

    @UseRequestContext()
    public async upsert(thread: Thread): Promise<void> {
        const existing = await this.get(thread.board, thread.number);

        if (existing) {
            existing.etag = thread.etag;
            existing.lastModified = thread.lastModified;
            return this.threadRepository.persistAndFlush(existing);
        }

        const dbThread = this.threadRepository.create(thread);
        return this.threadRepository.persistAndFlush(dbThread);
    }
}
