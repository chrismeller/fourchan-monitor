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
    private getBadDatesStatement!: SQLiteStatement;
    private updateBadDatesStatement!: SQLiteStatement;

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
        this.getBadDatesStatement = this.db.prepare(
            fs.readFileSync(
                path.join(__dirname, './queries/get-bad-dates.sql'),
                'utf-8',
            ),
        );
        this.updateBadDatesStatement = this.db.prepare(
            fs.readFileSync(
                path.join(__dirname, './queries/update-bad-dates.sql'),
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
            CreatedAt: post.CreatedAt.toISOString(),
            FileExtension: post.FileExtension,
            FileHash: post.FileHash,
            FileHeight: post.FileHeight,
            FileSize: post.FileSize,
            FileUploaded: post.FileUploaded?.toISOString(),
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

    public batchFixDates(posts: PostEntity[]): void {
        const upsertBatch = this.db.transaction((posts) => {
            for (const post of posts) {
                const created = new Date(post.CreatedAt);
                const uploaded = (post.FileUploaded) ? new Date(post.FileUploaded) : null;

                this.updateBadDatesStatement.run({
                    board: post.Board,
                    number: post.Number,
                    created_at: created.toISOString(),
                    file_uploaded: uploaded?.toISOString(),
                });
            }
        });

        upsertBatch(posts);
    }

    public getBatchOfInvalidDates(): PostEntity[] {
        const result = this.getBadDatesStatement.all();

        return result.map((x: any) => {
            return {
                Board: x.board,
                Number: x.number,
                Thread: x.thread,
                CreatedAt: x.created_at,
                FileUploaded: x.file_uploaded,
            } as PostEntity;
        });
    }
}
