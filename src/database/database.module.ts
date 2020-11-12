import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
//import { LevelDbProvider } from './leveldb.provider';
import { SQLiteProvider } from './sqlite.provider';

@Module({
  imports: [ConfigModule],
  providers: [SQLiteProvider],
  exports: [SQLiteProvider],
})
export class DatabaseModule {}
