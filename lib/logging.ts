// Imports
import winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");


// Validate log level
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


function isString(myVar: any): boolean {
  return typeof myVar === 'string' || myVar instanceof String;
}


function isObject(myVar: any): boolean {
  return typeof myVar === 'object' && myVar !== null;
}


let log2 = console.log;


interface StackTraceLine {
  functionName: string;
  filePath: string;
  lineNumber: number;
  columnNumber: number;
}


function parseStackTraceLine(stackTraceLine: string): StackTraceLine {
  // https://github.com/felixge/node-stack-trace/blob/master/index.js
  /* Example lines:
  at captureFunctionAndLine (/app/lib/logging.ts:33:19)
  at Logger.info (/app/lib/logging.ts:167:20)
  at processTicksAndRejections (node:internal/process/task_queues:95:5)
  at Object.onceWrapper (node:events:628:28)
  */
 // Replace multiple spaces with a single space
  stackTraceLine = stackTraceLine.replace(/\s+/g, ' ');
  let sections = stackTraceLine.trim().split(" ");
  let functionName = sections[1];
  let location = sections[2];
  location = location.slice(1, -1); // Remove parentheses
  let items = location.split(":");
  let filePath = items.slice(0, -2).join(":"); // Collect all but the last two items
  let lineNumber = items[items.length - 2];
  let columnNumber = items[items.length - 1];
  let result = {
    functionName,
    filePath,
    lineNumber: parseInt(lineNumber, 10),
    columnNumber: parseInt(columnNumber, 10),
  };
  return result;
}


function captureFunctionAndLine(index: number = 2) {
  try {
    throw new Error();
  } catch (e) {
    let stack = e.stack;
    let lines = stack.split("\n").slice(1);
    // Use index = 2 to move up through:
    // - captureFunctionAndLine
    // - Logger.info
    // and arrive at the caller.
    // Logger.log needs to pass in index = 3 so that we move up an extra level.
    if (index > lines.length) {
      index = lines.length - 1;
    }
    let line = lines[index];
    let result = parseStackTraceLine(line);
    return `[${result.functionName} : ${result.lineNumber}]`;
  }
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
      //log2(metadata);
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
      // Add spaces to align log levels.
      const m = 8;
      const spacing = level.length < m ? m - level.length : 0;
      const spaces = " ".repeat(spacing);
      let s = `${level}${spaces}: `;
      if (fileName) {
        s += `${fileName} `;
      }
      s += `${message}`;
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

  debug(message: any, meta?: { index: number}) {
    let index = 2;
    if (meta) {
      index = meta.index;
    }
    let location = captureFunctionAndLine(index);
    if (! isString(message)) {
      message = JSON.stringify(message, null, 2);
    }
    message = `${location} ${message}`;
    this.logger.debug(message);
  }

  info(message: any, meta?: { index: number}) {
    let index = 2;
    if (meta) {
      index = meta.index;
    }
    let location = captureFunctionAndLine(index);
    if (! isString(message)) {
      message = JSON.stringify(message, null, 2);
    }
    message = `${location} ${message}`;
    this.logger.info(message);
  }

  warn(message: any) {
    this.logger.warn(message);
  }

  error(message: any) {
    this.logger.error(message);
  }

  deb(message: any, meta?: { index: number}) {
    if (! meta) {
      meta = { index: 3 };
    }
    this.debug(message, meta);
  }

  dj(message: any) {
    let meta = { index: 4 };
    message = JSON.stringify(message, null, 2);
    this.deb(message, meta);
  }

  log(message: any, meta?: { index: number}) {
    if (! meta) {
      meta = { index: 3 };
    }
    this.info(message, meta);
  }

  lj(message: any) {
    let meta = { index: 4 };
    message = JSON.stringify(message, null, 2);
    this.log(message, meta);
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
