import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { serialize, deserialize } from 'class-transformer';
import { SQLiteProvider, SQLiteDatabase, SQLiteStatement } from '../database/sqlite.provider';
import { ThreadEntity } from './entities/thread.entity';

@Injectable()
export class ThreadsService {
	private readonly db: SQLiteDatabase;
	private readonly getStatement: SQLiteStatement;
	private readonly upsertStatement: SQLiteStatement;

	constructor(private readonly sqlite: SQLiteProvider) {
		this.db = sqlite.get();

		this.getStatement = this.db.prepare(fs.readFileSync(path.join(__dirname, './queries/get.sql')).toString());
		this.upsertStatement = this.db.prepare(fs.readFileSync(path.join(__dirname, './queries/upsert.sql')).toString());
	}

	// @todo we could also just store the serialized json as a key value pair...
	public get(board: string, threadNumber: number): ThreadEntity {
		try {
			const result = this.getStatement.get(board, threadNumber);

			if (result == null) return null;

			const thread: ThreadEntity = {
				Board: result.board,
				Number: result.number,
				Meta: {
					ETag: result.etag,
					LastModified: result.last_modified,
				},
			};
			return thread;
		}
		catch (error) {
			throw error;
		}
	}

	public upsert(thread: ThreadEntity): void {
		// @todo we should store last modified as an ISO date
		this.upsertStatement.run(thread.Board, thread.Number, thread.Meta.ETag, thread.Meta.LastModified);
	}
}
