import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
    SQLiteDatabase,
    SQLiteProvider,
    SQLiteStatement,
} from '../database/sqlite.provider';
import * as fs from 'fs';
import * as path from 'path';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostsService implements OnModuleInit {
    private readonly logger = new Logger(PostsService.name);

    private readonly db: SQLiteDatabase;
    private getStatement!: SQLiteStatement;
    private upsertStatement!: SQLiteStatement;

    constructor(sqlite: SQLiteProvider) {
        this.db = sqlite.get();
    }

    onModuleInit(): void {
        this.getStatement = this.db.prepare(
            fs.readFileSync(path.join(__dirname, './queries/get.sql'), 'utf-8'),
        );
        this.upsertStatement = this.db.prepare(
            fs.readFileSync(
                path.join(__dirname, './queries/upsert.sql'),
                'utf-8',
            ),
        );

        this.logger.debug('Statements prepared.');
    }

    public put(post: PostEntity): void {
        // not actually an upsert, just an insert with no-conflict
        this.upsertStatement.run({
            Board: post.Board,
            Comment: post.Comment,
            CreatedAt: post.CreatedAt.toUTCString(),
            FileExtension: post.FileExtension,
            FileHash: post.FileHash,
            FileHeight: post.FileHeight,
            FileSize: post.FileSize,
            FileUploaded: post.FileUploaded?.toUTCString(),
            FileWidth: post.FileWidth,
            Filename: post.Filename,
            Number: post.Number,
            PostersName: post.PostersName,
            Thread: post.Thread,
            UrlSlug: post.UrlSlug,
            Replies: post.Replies,
            ImageReplies: post.ImageReplies,
            UniqueIps: post.UniqueIps,
        });
    }

    public putBatch(posts: PostEntity[]): void {
        const t = this.db.transaction((posts) => {
            for (const post of posts) this.put(post);
        });

        t(posts);
    }
}
