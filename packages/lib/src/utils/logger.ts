import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, printf, colorize } = format;

export const winstonLogger = (appId: string): Logger => {
  const logFormat = printf(({ level, message, timestamp }) => {
    return `[${appId}] ${timestamp} ${level}: ${message}`;
  });

  const logger = createLogger({
    exitOnError: false,
    defaultMeta: { service: appId },
    format: combine(
      timestamp({ format: `YYYY-MM-DD HH:mm:ss` }),
      logFormat
    ),
    transports: [
      new transports.Console({
        format: combine(colorize(), timestamp(), logFormat),
        level: 'info'
      }),
      new transports.Console({
        format: combine(colorize(), timestamp(), logFormat),
        level: 'error'
      }),
    ],
  });

  logger.on('error', (error) => {
    console.error('Error in logger caught', error);
  });

  return logger;
}
