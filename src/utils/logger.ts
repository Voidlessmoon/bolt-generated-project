import { isProduction } from '@/config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private formatMessage(level: LogLevel, message: string) {
    return `[${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, data?: any) {
    if (!isProduction) {
      console.log(this.formatMessage('debug', message), data);
    }
  }

  info(message: string, data?: any) {
    console.log(this.formatMessage('info', message), data);
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('warn', message), data);
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage('error', message), error);
  }
}

export const logger = new Logger();
