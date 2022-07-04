export default {
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    dbName: 'postgres',
    entities: [
        'src/**/entities/*.entity.ts',
    ]
};