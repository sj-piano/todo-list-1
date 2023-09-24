import winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");

enum LogLevelList {
  "error",
  "warn",
  "info",
  "debug",
}
type LogLevel = keyof typeof LogLevelList;

function getLogLevel(logLevel: string): LogLevel {
  if (logLevel in LogLevelList) {
    return logLevel as LogLevel;
  }
  throw new Error(`Invalid log level: ${logLevel}`);
}

class Logger {
  logger: winston.Logger;

  constructor({
    fileName,
    logLevel,
    logTimestamp,
    logToFile,
  }: {
    fileName: string;
    logLevel: LogLevel;
    logTimestamp: boolean;
    logToFile: boolean;
  }) {
    if (fileName) {
      fileName = fileName.replace(process.cwd() + "/", "");
    }
    const logFormatterConsole = (metadata: any) => {
      let { level, message, stack, timestamp } = metadata;
      // An error object will have a stack property, and we'll use this instead of the message.
      message = stack || message;
      if (metadata.messageOnly) {
        /*
        - Return only the message without the log level and additional info
        - This allows us to use logger.print instead of console.log.
        - This means that we can use logger.print in the code and it will still log the message to the other transports e.g. a file.
        */
        /* eslint-disable no-control-regex */
        message = message.replace(/\x1B\[\d+m/g, ""); // Remove color codes from the message
        /* eslint-enable */
        message = message.trimStart(); // Remove effect of align().
        return message;
      }
      let s = `${level}: ${message}`;
      if (fileName) {
        s += ` - ${fileName}`;
      }
      if (logTimestamp) {
        s = `${timestamp} ` + s;
      }
      return s;
    };
    let transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss.SSS",
          }),
          winston.format.align(),
          winston.format.printf(logFormatterConsole),
        ),
      }),
    ];
    if (logToFile) {
      // Note: When logging to file, the timestamp is always included.
      transports.push(
        new DailyRotateFile({
          dirname: "logs",
          filename: "%DATE%.log",
          //datePattern: "YYYY-MM", // Use this pattern to rotate logs every month
          datePattern: "YYYY-MM-DD", // Use this pattern to rotate logs every day
          //datePattern: "YYYY-MM-DD-HH", // Use this pattern to rotate logs every hour
          //datePattern: "YYYY-MM-DD-HH-mm", // Use this pattern to rotate logs every minute (useful for testing)
          zippedArchive: false,
          maxSize: "20m", // Maximum log file size (optional)
          maxFiles: "30d", // Keep logs for 30 days (optional)
          format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp({
              format: "YYYY-MM-DD HH:mm:ss.SSS",
            }),
            winston.format.json(), // Use the JSON formatter to write logs in JSON format
          ),
        }),
      );
    }
    this.logger = winston.createLogger({
      level: logLevel as string,
      format: winston.format.errors({ stack: true }),
      transports,
    });
  }

  setLevel({ logLevel }: { logLevel: string }) {
    getLogLevel(logLevel);
    this.logger.transports.forEach((t) => (t.level = logLevel));
    this.logger.level = logLevel;
  }

  print(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    let metadata = { messageOnly: true };
    this.logger.info(arg, metadata);
    // At higher log levels, nothing will have been logged.
    // But: We still need console output for the user to see.
    // So: We log to the console here.
    let higherLogLevels = "warn error".split(" ");
    if (higherLogLevels.includes(this.logger.level)) {
      console.log(arg);
    }
  }

  debug(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.logger.debug(arg);
  }

  info(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.logger.info(arg);
  }

  warn(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.logger.warn(arg);
  }

  error(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.logger.error(arg);
  }

  deb(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.debug(arg);
  }

  dj(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.deb(JSON.stringify(arg, null, 2));
  }

  log(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.info(arg);
  }

  lj(...args: any[]) {
    let arg = args.length == 1 ? args[0] : args;
    this.log(JSON.stringify(arg, null, 2));
  }

}

function createLogger({
  fileName = "",
  logLevel = "info",
  logTimestamp = false,
  logToFile = false,
}) {
  const logger = new Logger({
    fileName,
    logLevel: getLogLevel(logLevel),
    logTimestamp,
    logToFile,
  });
  const log = logger.log.bind(logger);
  const lj = logger.lj.bind(logger);
  const deb = logger.deb.bind(logger);
  const dj = logger.dj.bind(logger);
  const warn = logger.warn.bind(logger);
  return { warn, logger, log, lj, deb, dj };
}

export { Logger, createLogger };
