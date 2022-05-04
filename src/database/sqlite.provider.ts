import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SQLite from 'better-sqlite3';

@Injectable()
export class SQLiteProvider implements OnModuleInit {
    private readonly logger = new Logger(SQLiteProvider.name);
    private readonly db: SQLite.Database;

    constructor(private readonly configService: ConfigService) {
        this.db = new SQLite(
            this.configService.get<string>('SQLITE_LOCATION', './db/sqlite.db'),
        );

        this.db.pragma('journal_mode = WAL');
        this.db.pragma('synchronous = NORMAL');
        this.db.pragma('temp_store= memory');
        this.db.pragma('mmap_size = 30000000000');
        this.db.pragma('auto_vacuum = FULL');
    }

    get(): SQLite.Database {
        return this.db;
    }

    async onModuleInit(): Promise<void> {
        await this.up();
    }

    async up() {
        this.logger.debug('Running migrations...');

        const db = this.get();

        // blindly try and create the migrations table
        db.exec(
            'create table if not exists migrations ( version varchar(25), migratedAt datetime )',
        );

        const getMigrationsStmt = db.prepare('select version from migrations');
        const insertMigrationStmt = db.prepare(
            'insert into migrations ( version, migratedAt ) values ( @version, @migratedAt )',
        );

        const migrationsPath = path.join(
            __dirname,
            this.configService.get<string>('MIGRATIONS_PATH', '../migrations'),
        );

        if (fs.existsSync(migrationsPath) == false) {
            this.logger.debug('No migrations found.');
            return;
        }

        // load in the list of migrations we have available
        const migrationsPathFiles = await fs.promises.readdir(migrationsPath);

        const availableMigrations = migrationsPathFiles.filter((v, i) => {
            return path.extname(v) === '.sql';
        });

        // make sure the migration metadata table exists and find the most recent migration if it does
        const appliedMigrations: string[] = getMigrationsStmt.pluck().all();

        const requiredMigrations = availableMigrations.filter((v, i) => {
            return appliedMigrations.find((x) => x == v) === undefined;
        });

        this.logger.debug(
            `Found ${requiredMigrations.length} required migrations.`,
        );

        for (const requiredMigration of requiredMigrations) {
            this.logger.debug(`Applying migration ${requiredMigration}`);

            const contents = await fs.promises.readFile(
                path.join(migrationsPath, requiredMigration),
                'utf-8',
            );

            // run the migration
            db.exec(contents);

            // mark it as run
            insertMigrationStmt.run({
                version: requiredMigration,
                migratedAt: new Date().toISOString(),
            });

            this.logger.debug(
                `Successfully applied migration ${requiredMigration}`,
            );
        }
    }
}

export type SQLiteDatabase = SQLite.Database;
export type SQLiteStatement = SQLite.Statement;
