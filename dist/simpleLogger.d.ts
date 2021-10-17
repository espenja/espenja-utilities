/// <reference types="node" />
export declare type SimpleLoggerOptions = {
    doLog?: boolean;
    useLoggerName?: boolean;
    useTimestamps?: boolean;
    timestampFormatter?: (s: Date) => string;
    objFormatter?: <R>(obj: any) => R;
};
export declare type Logger = (name: string, message?: any, obj?: any, options?: any) => void;
export declare type LoggerStatus = "INFO" | "WARN" | "ERROR";
export interface ISimpleLogger {
    log: Logger;
    warn: Logger;
    error: Logger;
}
export interface LogProvider {
    write: (simpleLogger: SimpleLogger, status: LoggerStatus, message: string | string[], obj?: any | any[]) => void;
}
export declare class SimpleLogger {
    name: string;
    protected options: Required<SimpleLoggerOptions>;
    protected loggers: Array<LogProvider>;
    constructor(name: string, options: Required<SimpleLoggerOptions>, loggers: Array<LogProvider>);
    getName: () => string;
    getOptions: () => Required<SimpleLoggerOptions>;
    log: (message: string, obj?: any) => void;
    warn: (message: string, obj?: any) => void;
    error: (message: string, obj?: any) => void;
    static getDefaultSimpleLoggerOptions: () => Required<SimpleLoggerOptions>;
    static createLogger: (name: string, options?: SimpleLoggerOptions | undefined, loggers?: LogProvider[] | undefined) => {
        log: (message: string, obj?: any) => void;
        warn: (message: string, obj?: any) => void;
        error: (message: string, obj?: any) => void;
    };
}
import { Color } from "colors";
declare type ConsoleLoggerOptions = {
    useColors?: boolean;
    colors?: {
        [k in LoggerStatus]: Color;
    };
};
declare type ConsoleLoggerInternalOptions = Required<ConsoleLoggerOptions>;
export declare class ConsoleLogger implements LogProvider {
    protected options: ConsoleLoggerInternalOptions;
    constructor(options: ConsoleLoggerInternalOptions);
    private buildMessage;
    private getLogger;
    write: (simpleLogger: SimpleLogger, status: LoggerStatus, message: string | string[], obj?: any | any[]) => void;
    static getDefaultOptions: () => Required<ConsoleLoggerInternalOptions>;
    static createConsoleLogger: (options?: ConsoleLoggerOptions) => ConsoleLogger;
}
import { PathLike } from "fs-extra";
declare type FileLoggerOptions = {
    logFilePath: PathLike;
};
declare type FileLoggerInternalOptions = Required<FileLoggerOptions>;
export declare class FileLogger implements LogProvider {
    protected options: FileLoggerInternalOptions;
    constructor(options: FileLoggerInternalOptions);
    private buildMessage;
    write: (simpleLogger: SimpleLogger, status: LoggerStatus, message: string | string[], obj?: any | any[]) => void;
    static createFileLogger: (options: FileLoggerOptions) => FileLogger;
}
export {};
