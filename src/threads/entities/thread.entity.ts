import { Type } from 'class-transformer';

export class Meta {
	ETag: string;
	LastModified: number;
}

export class ThreadEntity {
	Board: string;
	Number: number;
	@Type(() => Meta)
	Meta: Meta;
}
