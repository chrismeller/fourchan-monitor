import * as fs from 'fs';
import * as path from 'path';

for (const moduleDirectory of fs.readdirSync('./src/', { withFileTypes: true })) {
    // for some reason this seems not to work on Windows
    if (moduleDirectory.isDirectory) {
        const moduleQueriesPath = path.join('./src/', moduleDirectory.name, 'queries/');
        if (fs.existsSync(moduleQueriesPath)) {
            for (const queryFile of fs.readdirSync(moduleQueriesPath)) {
                const sourceName = path.join('./src/', moduleDirectory.name, '/queries/', queryFile);
                const destinationName = path.join('./dist/', moduleDirectory.name, '/queries/', queryFile);
                console.log(sourceName + ' -> ' + destinationName);

                if (fs.existsSync(path.dirname(destinationName)) === false) {
                    fs.mkdirSync(path.dirname(destinationName));
                }
                fs.copyFileSync(sourceName, destinationName);
            }
        }
    }
}
