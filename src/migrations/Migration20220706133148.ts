import { Migration } from '@mikro-orm/migrations';

export class Migration20220706133148 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" alter column "posters_name" type varchar(255) using ("posters_name"::varchar(255));');
    this.addSql('alter table "post" alter column "posters_name" drop not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "post" alter column "posters_name" type varchar(255) using ("posters_name"::varchar(255));');
    this.addSql('alter table "post" alter column "posters_name" set not null;');
  }

}
