import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../config/config.service';
import * as SQLite from 'better-sqlite3';

@Injectable({ scope: Scope.DEFAULT })
export class SQLiteProvider implements OnModuleInit {
  private readonly logger = new Logger(SQLiteProvider.name);
  private db: SQLite.Database;

  constructor(private readonly configService: ConfigService) {}

  get(): SQLite.Database {
    if (this.db != null ) {
      return this.db;
    }
    
    this.db = new SQLite(this.configService.get('SQLITE_LOCATION'));

    this.db.exec('pragma journal_mode = WAL');
    this.db.exec('pragma synchronous = NORMAL');
    this.db.exec('pragma temp_store= memory');
    this.db.exec('pragma mmap_size = 30000000000');

    return this.db;
  }


  async onModuleInit() {
  //   await this.up();
  }

  // async up() {
  //   this.logger.debug('Running migrations...');

  //   const db = this.get();

  //   const migrationsPath = path.join(__dirname, this.configService.get('MIGRATIONS_PATH', '../migrations'));

  //   // load in the list of migrations we have available
  //   const migrationsPathFiles = await fs.promises.readdir(migrationsPath);

  //   const availableMigrations = migrationsPathFiles.filter((v, i) => {
  //     return path.extname(v) === '.sql';
  //   });

  //   // make sure the migration metadata table exists and find the most recent migration if it does
  //   let appliedMigrations = [];
  //   try {
  //     appliedMigrations = await db.any<string>('select migrationVersion from migrations');
  //   } catch (e) {
  //     // if the table didn't exist, create it
  //     if (e.code === '42P01') {
  //       this.logger.debug('No migrations table found, creating it...');

  //       await db.none('create table migrations ( migrationVersion varchar(25), migratedAt varchar(25) );');
  //     }
  //     else {
  //       throw e;
  //     }
  //   }

  //   const requiredMigrations = availableMigrations.filter((v, i) => {
  //     return _.findKey(appliedMigrations, { migrationversion: v }) === undefined;
  //   });

  //   this.logger.debug(`Found ${requiredMigrations.length} required migrations.`);

  //   for (const requiredMigration of requiredMigrations) {
  //     const contents = await fs.promises.readFile(path.join(migrationsPath, requiredMigration), 'utf-8');

  //     // run the migration
  //     await db.none(contents);

  //     // mark it as run
  //     await db.none('insert into migrations ( migrationVersion, migratedAt ) values ( ${migrationVersion}, ${migratedAt} )',
  //       { migrationVersion: requiredMigration, migratedAt: new Date().toISOString() });

  //     this.logger.debug(`Successfully applied migration ${requiredMigration}`);
  //   }
  // }
}

export interface SQLiteDatabase extends SQLite.Database {}
export interface SQLiteStatement extends SQLite.Statement {}