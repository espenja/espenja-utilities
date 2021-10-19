"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLogger = exports.ConsoleLogger = exports.SimpleLogger = void 0;
class SimpleLogger {
    name;
    options;
    loggers;
    constructor(name, options, loggers) {
        this.name = name;
        this.options = options;
        this.loggers = loggers;
    }
    getName = () => this.name;
    getOptions = () => this.options;
    log = (message, obj) => {
        this.loggers.forEach((d) => d.write(this, "INFO", message, obj));
    };
    warn = (message, obj) => {
        this.loggers.forEach((d) => d.write(this, "WARN", message, obj));
    };
    error = (message, obj) => {
        this.loggers.forEach((d) => d.write(this, "ERROR", message, obj));
    };
    static getDefaultSimpleLoggerOptions = () => {
        return {
            useLoggerName: true,
            useTimestamps: true,
            doLog: true,
            timestampFormatter: (date) => {
                return date.toLocaleTimeString();
            },
            objFormatter: (obj) => obj
        };
    };
    static createLogger = (name, options, loggers) => {
        const useOptions = { ...this.getDefaultSimpleLoggerOptions(), ...options };
        let useLoggers = loggers || [];
        if (!useLoggers.length) {
            useLoggers = [ConsoleLogger.createConsoleLogger()];
        }
        const logger = new SimpleLogger(name, useOptions, useLoggers);
        return { log: logger.log, warn: logger.warn, error: logger.error };
    };
}
exports.SimpleLogger = SimpleLogger;
// Console Logger
const console_1 = require("console");
const colors_1 = __importDefault(require("colors"));
class ConsoleLogger {
    options;
    constructor(options) {
        this.options = options;
    }
    buildMessage(name, options, color, message) {
        const messageStr = message ?? "";
        const nameStr = options.useLoggerName ? `${name}` : "";
        const timeStampStr = options.useTimestamps ? options.timestampFormatter(new Date()) : "";
        let logMessage = messageStr;
        if (options.useColors) {
            logMessage = `${colors_1.default.green(timeStampStr)} ${color(nameStr)}: ${messageStr}`;
        }
        else {
            logMessage = `${timeStampStr} ${nameStr}: ${messageStr}`;
        }
        logMessage.replace(/\s{2,}/g, " ");
        return logMessage;
    }
    getLogger = (status) => {
        switch (status) {
            case "ERROR":
                return console_1.error;
            case "INFO":
                return console_1.log;
            case "WARN":
                return console_1.warn;
        }
    };
    write = (simpleLogger, status, message, obj) => {
        const useOptions = { ...simpleLogger.getOptions(), ...this.options };
        const name = simpleLogger.getName();
        if (!useOptions.doLog)
            return;
        const logger = this.getLogger(status);
        const logMessages = Array.isArray(message)
            ? message.map((d) => this.buildMessage(name, useOptions, this.options.colors[status], d))
            : [this.buildMessage(name, useOptions, this.options.colors[status], message)];
        if (logMessages?.length) {
            for (const logMessage of logMessages) {
                logger(logMessage);
            }
        }
        if (obj) {
            console.dir(obj, { depth: null });
        }
    };
    static getDefaultOptions = () => {
        return {
            useColors: true,
            colors: {
                ERROR: colors_1.default.red,
                INFO: colors_1.default.blue,
                WARN: colors_1.default.yellow
            }
        };
    };
    static createConsoleLogger = (options = this.getDefaultOptions()) => {
        const useOptions = {
            ...this.getDefaultOptions(),
            ...options
        };
        return new ConsoleLogger(useOptions);
    };
}
exports.ConsoleLogger = ConsoleLogger;
// File Logger
const fs_extra_1 = require("fs-extra");
class FileLogger {
    options;
    constructor(options) {
        this.options = options;
    }
    buildMessage = (name, options, status, message, obj) => {
        const messageStr = message;
        const timeStampStr = options.timestampFormatter(new Date());
        const nameStr = options.useLoggerName ? `${name}` : "";
        const logMessage = `${timeStampStr} ${nameStr}: ${messageStr}`;
        return logMessage;
    };
    write = (simpleLogger, status, message, obj) => {
        const options = { ...simpleLogger.getOptions(), ...this.options };
        const name = simpleLogger.getName();
        const logMessages = Array.isArray(message)
            ? message.map((d) => this.buildMessage(name, options, status, d))
            : [this.buildMessage(name, options, status, message)];
        const objMessages = Array.isArray(obj) ? obj.map((d) => options.objFormatter(d)) : [options.objFormatter(obj)];
        // Log message
        if (message?.length) {
            for (const logMessage of logMessages) {
                (0, fs_extra_1.ensureFileSync)(this.options.logFilePath.toString());
                (0, fs_extra_1.appendFileSync)(this.options.logFilePath.toString(), logMessage + "\n", {
                    encoding: "utf8"
                });
            }
        }
        // Log object
        if (objMessages.length) {
            for (const objMessage of objMessages) {
                (0, fs_extra_1.ensureFileSync)(this.options.logFilePath.toString());
                (0, fs_extra_1.appendFileSync)(this.options.logFilePath.toString(), objMessage + "\n", {
                    encoding: "utf8"
                });
            }
        }
    };
    static createFileLogger = (options) => {
        return new FileLogger(options);
    };
}
exports.FileLogger = FileLogger;
//# sourceMappingURL=simpleLogger.js.map