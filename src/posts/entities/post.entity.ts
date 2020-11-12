export class PostEntity {
	Board: string;
	Thread: number;
	// com
	Comment: string;
	// ext
	FileExtension: string;
	Filename: string;
	// fsize
	FileSize: number;
	// h
	FileHeight: number;
	// md5
	FileHash: string;
	// name
	PostersName: string;
	// no
	Number: number;
	// semantic_url
	UrlSlug: string;
	// tim
	FileUploaded: Date;
	// time
	CreatedAt: Date;
	// w
	FileWidth: number;
}
