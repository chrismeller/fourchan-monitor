import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
    SQLiteDatabase,
    SQLiteProvider,
    SQLiteStatement,
} from '../database/sqlite.provider';
import * as path from 'path';
import * as fs from 'fs';
import { ThreadEntity } from './entities/thread.entity';

@Injectable()
export class ThreadsService implements OnModuleInit {
    private readonly logger = new Logger(ThreadsService.name);

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

    public get(board: string, threadNumber: number): ThreadEntity | null {
        try {
            const result = this.getStatement.get(board, threadNumber);

            if (result == null) return null;

            return {
                Board: result.board,
                Number: result.number,
                Meta: {
                    ETag: result.etag,
                    LastModified: result.last_modified,
                },
            } as ThreadEntity;
        } catch (e) {
            throw e;
        }
    }

    public upsert(thread: ThreadEntity): void {
        this.upsertStatement.run({
            board: thread.Board,
            number: thread.Number,
            etag: thread.Meta.ETag,
            last_modified: thread.Meta.LastModified?.toISOString(),
        });
    }

    public batchFixDates(threads: ThreadEntity[]): void {
        const upsertBatch = this.db.transaction((threads) => {
            for (const thread of threads) {
                const d = new Date(thread.Meta.LastModified);

                this.updateBadDatesStatement.run({
                    board: thread.Board,
                    number: thread.Number,
                    last_modified: d.toISOString(),
                });
            }
        });

        upsertBatch(threads);
    }

    public getBatchOfInvalidDates(): ThreadEntity[] {
        const result = this.getBadDatesStatement.all();

        return result.map((x: any) => {
            return {
                Board: x.board,
                Number: x.number,
                Meta: {
                    ETag: x.etag,
                    LastModified: x.last_modified,
                },
            } as ThreadEntity;
        });
    }
}
