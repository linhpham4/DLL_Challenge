import winston from "winston";

const { combine, timestamp, errors, printf } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} ${level}: ${stack || message}`;
    })
  ),
  transports: [new winston.transports.File({ 
    dirname: process.env.LOG_DIR,
    filename: "app.log" })],
});

export default logger;