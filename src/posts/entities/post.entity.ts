import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post {
    @PrimaryKey()
    board!: string;

    @PrimaryKey()
    thread!: number;

    @Property({ nullable: true, columnType: 'text' })
    comment?: string;

    @Property({ nullable: true })
    fileExtension?: string;

    @Property({ nullable: true })
    fileName?: string;

    @Property({ nullable: true })
    fileSize?: number;

    @Property({ nullable: true })
    fileHeight?: number;

    @Property({ nullable: true })
    fileHash?: string;

    @Property({ nullable: true })
    postersName: string;

    @PrimaryKey()
    number: number;

    @Property({ nullable: true })
    urlSlug?: string;

    @Property({ nullable: true })
    fileUploaded?: Date;

    @Property()
    createdAt: Date;

    @Property({ nullable: true })
    fileWidth?: number;

    @Property({ nullable: true })
    replies?: number;

    @Property({ nullable: true })
    imageReplies?: number;

    @Property({ nullable: true })
    uniqueIps?: number;
}
