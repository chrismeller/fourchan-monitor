import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
//import levelup, { LevelUp } from 'levelup';
//import leveldown, { LevelDown } from 'leveldown';
//import level from 'level';
import { ConfigService } from '../config/config.service';

// @Injectable({ scope: Scope.DEFAULT })
// export class LevelDbProvider {
//   private readonly logger = new Logger(LevelDbProvider.name);
//   private db: LevelUp<LevelDown>;

//   constructor(private readonly configService: ConfigService) {}

//   get() {
//     if (this.db != null ) {
//       return this.db;
//     }

//     levelup(leveldown(this.configService.get('LEVELDB_LOCATION')), (err, db) => {
//       this.db = db;

//       return this.db;
//     } );
//   }
// }