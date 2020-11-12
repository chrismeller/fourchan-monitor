import * as fs from 'fs';
import * as path from 'path';

for (const moduleDirectory of fs.readdirSync('./src/', { withFileTypes: true })) {
    // for some reason this seems not to work on Windows
    if (moduleDirectory.isDirectory) {
        const moduleMigrationsPath = path.join('./src/', moduleDirectory.name, 'migrations/');
        if (fs.existsSync(moduleMigrationsPath)) {
            for (const migrationFile of fs.readdirSync(moduleMigrationsPath)) {
                const sourceName = path.join('./src/', moduleDirectory.name, '/migrations/', migrationFile);
                // for migrations, everything goes in one directory and we prefix the filename with the module name
                const destinationName = path.join('./dist/migrations/', moduleDirectory.name + '_' + migrationFile);
                console.log(sourceName + ' -> ' + destinationName);

                if (fs.existsSync(path.dirname(destinationName)) === false) {
                    fs.mkdirSync(path.dirname(destinationName));
                }
                fs.copyFileSync(sourceName, destinationName);
            }
        }
    }
}
