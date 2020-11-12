interface ThreadPageDto {
    page: number;
    threads: Array<ThreadDto>;
}

interface ThreadDto {
    no: number;
    last_modified: number;
    replies: number;
}

export type { ThreadDto, ThreadPageDto };