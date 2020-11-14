import { Injectable } from '@nestjs/common'
import * as fs from 'fs';
import * as path from 'path';
import { serialize, deserialize } from 'class-transformer';
import { SQLiteProvider, SQLiteDatabase, SQLiteStatement } from '../database/sqlite.provider';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostsService {
	private readonly db: SQLiteDatabase;
	private readonly getStatement: SQLiteStatement;
	private readonly upsertStatement: SQLiteStatement;


	constructor(private readonly sqlite: SQLiteProvider) {
		this.db = sqlite.get();

		this.getStatement = this.db.prepare(fs.readFileSync(path.join(__dirname, './queries/get.sql')).toString());
		this.upsertStatement = this.db.prepare(fs.readFileSync(path.join(__dirname, './queries/upsert.sql')).toString());
	}

	public get(board: string, threadNumber: number, postNumber: number): PostEntity {
		try {
			const result = this.getStatement.get(board, threadNumber, postNumber);
			const post: PostEntity = {
				Board: result.board,
				Comment: result.comment,
				CreatedAt: result.created_at,
				FileExtension: result.file_extension,
				FileHash: result.file_hash,
				FileHeight: result.file_height,
				FileSize: result.file_size,
				FileUploaded: result.file_uploaded,
				FileWidth: result.file_width,
				Filename: result.filename,
				Number: result.number,
				PostersName: result.posters_name,
				Thread: result.thread,
				UrlSlug: result.url_slug,
			};
			return post;
		}
		catch (error) {
			throw error;
		}
	}

	public put(post: PostEntity): void {
		// not actually an upsert
		this.upsertStatement.run(
			post.Board,
			post.Comment,
			post.CreatedAt?.toISOString(),
			post.FileExtension,
			post.FileHash,
			post.FileHeight,
			post.FileSize,
			post.FileUploaded?.toISOString(),
			post.FileWidth,
			post.Filename,
			post.Number,
			post.PostersName,
			post.Thread,
			post.UrlSlug,
		);
	}

	public putBatch(posts: Array<PostEntity>): void {
		const t = this.db.transaction((posts) => {
			for (const post of posts) this.put(post);
		});

		t(posts);
	}
}
