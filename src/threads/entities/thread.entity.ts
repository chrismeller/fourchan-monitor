import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Thread {
    @PrimaryKey({ length: 5 })
    board!: string;

    @PrimaryKey()
    number!: number;

    @Property({ nullable: true })
    etag?: string;

    @Property()
    lastModified!: Date;
}
