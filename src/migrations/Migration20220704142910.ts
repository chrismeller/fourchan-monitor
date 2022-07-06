import { Migration } from '@mikro-orm/migrations';

export class Migration20220704142910 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "thread" ("board" varchar(5) not null, "number" int not null, "etag" varchar(255) null, "last_modified" timestamptz(0) not null);');
    this.addSql('alter table "thread" add constraint "thread_pkey" primary key ("board", "number");');

    this.addSql('create table "post" ("board" varchar(255) not null, "thread" int not null, "number" int not null, "comment" text null, "file_extension" varchar(255) null, "file_name" varchar(255) null, "file_size" int null, "file_height" int null, "file_hash" varchar(255) null, "posters_name" varchar(255) not null, "url_slug" varchar(255) null, "file_uploaded" timestamptz(0) null, "created_at" timestamptz(0) not null, "file_width" int null, "replies" int null, "image_replies" int null, "unique_ips" int null);');
    this.addSql('alter table "post" add constraint "post_pkey" primary key ("board", "thread", "number");');
  }

}
