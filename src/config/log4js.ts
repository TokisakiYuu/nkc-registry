import { configure } from "log4js";

configure({
  appenders: {
    "access": {
      type: "dateFile",
      filename: "log/access.log",
      pattern: "-yyyy-MM-dd",
      daysToKeep: 7,
      compress: true,
      category: "http"
    },
    "app": {
      type: "file",
      filename: "log/app.log",
      maxLogSize: 10 * 1024 * 1024,
      numBackups: 3
    },
    "errorFile": {
      type: "file",
      filename: "log/errors.log",
    },
    "errors": {
      type: "logLevelFilter",
      level: "ERROR",
      appender: "errorFile",
    },
    "console": {
      type: "console"
    }
  },
  categories: {
    "default": {
      appenders: ["app", "errors", "console"],
      level: "DEBUG"
    },
    "MSRegistry": {
      appenders: ["access", "console"],
      level: "DEBUG"
    },
    "DT": {
      appenders: ["console"],
      level: "DEBUG"
    }
  }
});
