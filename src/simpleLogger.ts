export type SimpleLoggerOptions = {
	doLog?: boolean
	useLoggerName?: boolean
	useTimestamps?: boolean
	timestampFormatter?: (s: Date) => string
	objFormatter?: <R>(obj: any) => R
}

export type Logger = (name: string, message?: any, obj?: any, options?: any) => void
export type LoggerStatus = "INFO" | "WARN" | "ERROR"

export interface ISimpleLogger {
	log: Logger
	warn: Logger
	error: Logger
}

export interface LogProvider {
	write: (simpleLogger: SimpleLogger, status: LoggerStatus, message: string | string[], obj?: any | any[]) => void
}

export class SimpleLogger {
	constructor(
		public name: string,
		protected options: Required<SimpleLoggerOptions>,
		protected loggers: Array<LogProvider>
	) {}

	getName = () => this.name
	getOptions = () => this.options

	log = (message: string, obj?: any) => {
		this.loggers.forEach((d) => d.write(this, "INFO", message, obj))
	}

	warn = (message: string, obj?: any) => {
		this.loggers.forEach((d) => d.write(this, "WARN", message, obj))
	}

	error = (message: string, obj?: any) => {
		this.loggers.forEach((d) => d.write(this, "ERROR", message, obj))
	}

	public static getDefaultSimpleLoggerOptions = (): Required<SimpleLoggerOptions> => {
		return {
			useLoggerName: true,
			useTimestamps: true,
			doLog: true,
			timestampFormatter: (date: Date) => {
				return date.toLocaleTimeString()
			},
			objFormatter: <R = string>(obj: R) => obj
		}
	}

	public static createLogger = (name: string, options?: SimpleLoggerOptions, loggers?: Array<LogProvider>) => {
		const useOptions = { ...this.getDefaultSimpleLoggerOptions(), ...options }
		let useLoggers = loggers || []

		if (!useLoggers.length) {
			useLoggers = [ConsoleLogger.createConsoleLogger()]
		}

		const logger = new SimpleLogger(name, useOptions, useLoggers)
		return { log: logger.log, warn: logger.warn, error: logger.error }
	}
}

// Console Logger

import { log as clog, error as cerror, warn as cwarn } from "console"
import colors, { Color } from "colors"

type ConsoleLoggerOptions = {
	useColors?: boolean
	colors?: {
		[k in LoggerStatus]: Color
	}
}

type ConsoleLoggerInternalOptions = Required<ConsoleLoggerOptions>

export class ConsoleLogger implements LogProvider {
	constructor(protected options: ConsoleLoggerInternalOptions) {}

	private buildMessage(
		name: string,
		options: Required<ConsoleLoggerOptions & SimpleLoggerOptions>,
		color: Color,
		message: string
	) {
		const messageStr = message ?? ""
		const nameStr = options.useLoggerName ? `${name}` : ""
		const timeStampStr = options.useTimestamps ? options.timestampFormatter(new Date()) : ""

		let logMessage = messageStr

		if (options.useColors) {
			logMessage = `${colors.green(timeStampStr)} ${color(nameStr)}: ${messageStr}`
		} else {
			logMessage = `${timeStampStr} ${nameStr}: ${messageStr}`
		}

		logMessage.replace(/\s{2,}/g, " ")

		return logMessage
	}

	private getLogger = (status: LoggerStatus) => {
		switch (status) {
			case "ERROR":
				return cerror
			case "INFO":
				return clog
			case "WARN":
				return cwarn
		}
	}

	public write = (simpleLogger: SimpleLogger, status: LoggerStatus, message: string | string[], obj?: any | any[]) => {
		const useOptions = { ...simpleLogger.getOptions(), ...this.options }
		const name = simpleLogger.getName()

		if (!useOptions.doLog) return

		const logger = this.getLogger(status)

		const logMessages = Array.isArray(message)
			? message.map((d) => this.buildMessage(name, useOptions, this.options.colors[status], d))
			: [this.buildMessage(name, useOptions, this.options.colors[status], message)]

		if (logMessages?.length) {
			for (const logMessage of logMessages) {
				logger(logMessage)
			}
		}

		if (obj) {
			console.dir(obj, { depth: null })
		}
	}

	public static getDefaultOptions = (): Required<ConsoleLoggerInternalOptions> => {
		return {
			useColors: true,
			colors: {
				ERROR: colors.red,
				INFO: colors.blue,
				WARN: colors.yellow
			}
		}
	}

	public static createConsoleLogger = (options: ConsoleLoggerOptions = this.getDefaultOptions()) => {
		const useOptions = {
			...this.getDefaultOptions(),
			...options
		}

		return new ConsoleLogger(useOptions)
	}
}

// File Logger

import { PathLike, appendFileSync, ensureFileSync } from "fs-extra"

type FileLoggerOptions = {
	logFilePath: PathLike
}

type FileLoggerInternalOptions = Required<FileLoggerOptions>

export class FileLogger implements LogProvider {
	constructor(protected options: FileLoggerInternalOptions) {}

	private buildMessage = (
		name: string,
		options: Required<SimpleLoggerOptions>,
		status: LoggerStatus,
		message: string | string[],
		obj?: any | any[]
	) => {
		const messageStr = message
		const timeStampStr = options.timestampFormatter(new Date())
		const nameStr = options.useLoggerName ? `${name}` : ""
		const logMessage = `${timeStampStr} ${nameStr}: ${messageStr}`

		return logMessage
	}

	write = (simpleLogger: SimpleLogger, status: LoggerStatus, message: string | string[], obj?: any | any[]) => {
		const options = { ...simpleLogger.getOptions(), ...this.options }
		const name = simpleLogger.getName()

		const logMessages = Array.isArray(message)
			? message.map((d) => this.buildMessage(name, options, status, d))
			: [this.buildMessage(name, options, status, message)]

		const objMessages = Array.isArray(obj) ? obj.map((d) => options.objFormatter(d)) : [options.objFormatter(obj)]

		// Log message
		if (message?.length) {
			for (const logMessage of logMessages) {
				ensureFileSync(this.options.logFilePath.toString())
				appendFileSync(this.options.logFilePath.toString(), logMessage + "\n", {
					encoding: "utf8"
				})
			}
		}

		// Log object
		if (objMessages.length) {
			for (const objMessage of objMessages) {
				ensureFileSync(this.options.logFilePath.toString())
				appendFileSync(this.options.logFilePath.toString(), objMessage + "\n", {
					encoding: "utf8"
				})
			}
		}
	}

	public static createFileLogger = (options: FileLoggerOptions) => {
		return new FileLogger(options)
	}
}
