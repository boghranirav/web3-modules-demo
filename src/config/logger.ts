import { Request } from "express";
import winston, { format } from "winston";
const { combine, timestamp, printf } = format;
import "winston-daily-rotate-file";

let transport = null;
let loggers: any;

const customFormat = printf(({ message, timestamp, logInfo }) => {
  return `${timestamp} - ${message}: ${logInfo ? JSON.stringify(logInfo) : ""}`;
});

const dailyRotateConfig = (filePath: string, level: string) => {
  const rotateConfig = {
    configRotatelevel: level,
    filename: filePath + `/%DATE%-${level}.log`,
    datePattern: "DD-MM-YYYY",
    zippedArchive: true,
    format: combine(timestamp(), customFormat),
  };

  return new winston.transports.DailyRotateFile(rotateConfig);
};

const setPath = async (path: string) => {
  transport = {
    info: dailyRotateConfig(path, "info"),
    error: dailyRotateConfig(path, "error"),
    warn: dailyRotateConfig(path, "warn"),
  };

  loggers = {
    loggerInfo: winston.createLogger({ transports: [transport.info] }),
    errorInfo: winston.createLogger({ transports: [transport.error] }),
    warnInfo: winston.createLogger({ transports: [transport.warn] }),
  };
};

const logger = {
  info: async (functionName: string, args: object, message: string) => {
    const logInfo = logInformation(functionName, args);
    loggers.loggerInfo.info(message, { logInfo });
  },
  error: async (
    functionName: string,
    args: object,
    message: string,
    error?: string
  ) => {
    const logInfo = logInformation(functionName, args, error);
    loggers.errorInfo.error(message, { logInfo });
  },
  warn: async (
    functionName: string,
    args: object,
    message: string,
    error?: string
  ) => {
    const logInfo = logInformation(functionName, args, error);
    loggers.warnInfo.warn(message, { logInfo });
  },
};

const logInformation = (functionName: string, args: object, error?: string) => {
  const response: {
    functionName: string;
    args: object;
    error?: string;
  } = {
    functionName: functionName,
    args: args,
    error: error,
  };

  return response;
};

export { logger, setPath };
