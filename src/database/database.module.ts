import { Module } from '@nestjs/common';
import { SQLiteProvider } from './sqlite.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [SQLiteProvider],
    exports: [SQLiteProvider],
})
export class DatabaseModule {}
