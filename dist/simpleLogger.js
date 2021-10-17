export class SimpleLogger {
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
// Console Logger
import { log as clog, error as cerror, warn as cwarn } from "console";
import colors from "colors";
export class ConsoleLogger {
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
            logMessage = `${colors.green(timeStampStr)} ${color(nameStr)}: ${messageStr}`;
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
                return cerror;
            case "INFO":
                return clog;
            case "WARN":
                return cwarn;
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
                ERROR: colors.red,
                INFO: colors.blue,
                WARN: colors.yellow
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
// File Logger
import { appendFileSync, ensureFileSync } from "fs-extra";
export class FileLogger {
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
                ensureFileSync(this.options.logFilePath.toString());
                appendFileSync(this.options.logFilePath.toString(), logMessage + "\n", {
                    encoding: "utf8"
                });
            }
        }
        // Log object
        if (objMessages.length) {
            for (const objMessage of objMessages) {
                ensureFileSync(this.options.logFilePath.toString());
                appendFileSync(this.options.logFilePath.toString(), objMessage + "\n", {
                    encoding: "utf8"
                });
            }
        }
    };
    static createFileLogger = (options) => {
        return new FileLogger(options);
    };
}
//# sourceMappingURL=simpleLogger.js.map