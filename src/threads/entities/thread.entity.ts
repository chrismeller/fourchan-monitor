
interface Meta {
	ETag: string | null;
	LastModified: number;
}

export interface ThreadEntity {
	Board: string;
	Number: number;
	Meta: Meta;
}
