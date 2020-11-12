import { Injectable, Logger, Scope } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '../config/config.service';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends Logger {
  private readonly winston: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    super();

    // this.winston = new winston.Container();
    this.winston = winston.createLogger();

    if (configService.getBoolean('LOGGING_CONSOLE_ENABLED', true) === true) {
      this.winston.add(new winston.transports.Console({
          silent: false,
          level: configService.get('LOGGING_CONSOLE_LEVEL', 'debug'),
      }));
    }
  }
}
