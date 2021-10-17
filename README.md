A collection of helpful utilities  
Install with `npm install espenja-utilities` or `yarn install espenja-utilities`

# pickFromObjects

Read an object as a typed object

```typescript
import { defaultFormatters, pickFromObject } from "./pickFromObject"

const config = pickFromObject({ ...process.env }, (required, optional) => ({
	dev: required("NODE_ENV", defaultFormatters.isNot("production")),
	port: optional("PORT", 3000),
	firstFound: required(["one", "two"], (value) => Buffer.from(value)),
	customObject: required("CUSTOM", (value) => {
		const parts = value.split(";")
		return {
			firstname: parts[0],
			lastname: parseInt(parts[1])
		}
	})
}))
```

Type of `config` will be

```typescript
const config: {
	dev: boolean
	port: number
	firstFound: Buffer
	customObject: {
		firstname: string
		lastname: number
	}
}
```

# simpleLogger

Create a simple logger with optional color support and various options.  
Default loggers include logging to console and file.

## Default logger with Console support

```typescript
import { SimpleLogger } from "./simpleLogger"

const { error, log, warn } = SimpleLogger.createLogger("simplest logger")

error("errorMessage", {})
log("infoMessage", {})
warn("warningMessage", {})
```

## Console and File logging

```typescript
import path from "path"
import { SimpleLogger, ConsoleLogger, FileLogger } from "./simpleLogger"

const { error, log, warn } = SimpleLogger.createLogger(
	"espenja-utilities",
	{
		doLog: true,
		useLoggerName: false,
		useTimestamps: true
	},
	[
		ConsoleLogger.createConsoleLogger(),
		FileLogger.createFileLogger({
			logFilePath: path.resolve("logFile.txt")
		})
	]
)
```

Custom loggers can be created by implementing the `LogProvider` interface.
