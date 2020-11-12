import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor(filePath: string) {
    this.envConfig = dotenv.parse(fs.readFileSync(filePath));
  }

  get(key: string, defaultValue: string = '', required: boolean = false): string {
    if (this.envConfig[key] === undefined && required === false) {
      return defaultValue;
    }

    return this.envConfig[key];
  }

  getBoolean(key: string, defaultValue: boolean = false, required: boolean = false): boolean {
    if (this.envConfig[key] === undefined && required === false) {
      return defaultValue;
    }

    return (Boolean(this.envConfig[key])).valueOf();
  }
}
