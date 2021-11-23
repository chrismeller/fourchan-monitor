interface Meta {
    ETag?: string;
    LastModified: Date;
}

export interface ThreadEntity {
    Board: string;
    Number: number;
    Meta: Meta;
}
