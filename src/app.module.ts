import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BoardsModule } from './boards/boards.module';
import { ThreadsModule } from './threads/threads.module';
import { PostsModule } from './posts/posts.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MikroOrmModule.forRootAsync({
            imports:[ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgresql',
                host: configService.get<string>('DATABASE_HOST', 'localhost'),
                port: configService.get<number>('DATABASE_PORT', 5432),
                user: configService.get<string>('DATABASE_USERNAME', 'postgres'),
                password: configService.get<string>('DATABASE_PASSWORD', 'password'),
                dbName: configService.get<string>('DATABASE_DATABASE', 'postgres'),
                entities: [],
                autoLoadEntities: true,
                migrations: {
                    path: 'dist/migrations',
                    pathTs: 'src/migrations',
                }
            }),
        }),
        BoardsModule,
        ThreadsModule,
        PostsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
