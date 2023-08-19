import path from 'path';
import * as util from 'util';

enum LevelEnum {
	LOG,
	INFO,
	WARN,
	ERROR,
	DEBUG,
}

enum ColorEnum {
	RESET = '\x1b[0m',
	BRIGHT = '\x1b[1m',
	DIM = '\x1b[2m',
	UNDERSCORE = '\x1b[4m',
	BLINK = '\x1b[5m',
	REVERSE = '\x1b[7m',
	HIDDEN = '\x1b[8m',
	FG_BLACK = '\x1b[30m',
	FG_RED = '\x1b[31m',
	FG_GREEN = '\x1b[32m',
	FG_YELLOW = '\x1b[33m',
	FG_BLUE = '\x1b[34m',
	FG_MAGENTA = '\x1b[35m',
	FG_CYAN = '\x1b[36m',
	FG_WHITE = '\x1b[37m',
	FG_GRAY = '\x1b[90m',
	BG_BLACK = '\x1b[40m',
	BG_RED = '\x1b[41m',
	BG_GREEN = '\x1b[42m',
	BG_YELLOW = '\x1b[43m',
	BG_BLUE = '\x1b[44m',
	BG_MAGENTA = '\x1b[45m',
	BG_CYAN = '\x1b[46m',
	BG_WHITE = '\x1b[47m',
	BG_GRAY = '\x1b[100m',
}

interface OptionsInterface {
	modify?: { search: RegExp | string; replace: string };
	strip?: RegExp | string;
	shortPath?: boolean;
}

interface TraceOptionsInterface extends OptionsInterface {
	filter?: RegExp;
	omit?: RegExp;
	level?: number;
}

class DebugHelper {
	private static self: DebugHelper;
	private static options: OptionsInterface = {
		shortPath: false,
	};

	public static getInstance(): DebugHelper {
		if (!DebugHelper.self) {
			DebugHelper.self = new DebugHelper();
		}
		return DebugHelper.self;
	}

	public overwriteConsole(options?: OptionsInterface): void {
		DebugHelper.options = {
			...DebugHelper.options,
			...options,
		};
		console.log = (...args: unknown[]): void => this.log(...args);
		console.warn = (...args: unknown[]): void => this.warn(...args);
		console.info = (...args: unknown[]): void => this.info(...args);
		console.error = (...args: unknown[]): void => this.error(...args);
		console.debug = (...args: unknown[]): void => this.debug(...args);
	}

	public log(...data: unknown[]): void {
		this.stdout(LevelEnum.LOG, this.trace(new Error(), { ...DebugHelper.options, level: 2 }), data);
	}

	public info(...data: unknown[]): void {
		this.stdout(LevelEnum.INFO, this.trace(new Error(), { ...DebugHelper.options, level: 2 }), data);
	}

	public warn(...data: unknown[]): void {
		this.stdout(LevelEnum.WARN, this.trace(new Error(), { ...DebugHelper.options, level: 2 }), data);
	}

	public error(...data: unknown[]): void {
		this.stdout(LevelEnum.ERROR, this.trace(new Error(), { ...DebugHelper.options, level: 2 }), data);
	}

	public debug(...data: unknown[]): void {
		this.stdout(LevelEnum.DEBUG, this.trace(new Error(), { ...DebugHelper.options }), data);
	}

	public trace(error: Error, options?: TraceOptionsInterface): string[] {
		const cwd = process.cwd();
		let matches = [];
		const myString = error.stack as string;
		const myRegexp = /\/(.+:\d+:\d+)/gm;
		let match = myRegexp.exec(myString);
		while (match != null) {
			if (match[0].indexOf(cwd) !== -1) {
				matches.push(match[0]);
			}
			match = myRegexp.exec(myString);
		}
		if (options?.filter) {
			matches = matches.filter((item) => {
				return (options.filter as RegExp).test(item);
			});
		}
		if (options?.omit) {
			matches = matches.filter((item) => {
				return !(options.omit as RegExp).test(item);
			});
		}
		if (options?.modify) {
			matches = matches.map((item) => {
				return item.replace(options.modify?.search as RegExp, options.modify?.replace as string);
			});
		}
		if (options?.shortPath) {
			matches = matches.map((item) => {
				return path.relative(process.cwd(), item);
			});
		}
		if (options?.strip) {
			matches = matches.map((item) => {
				return item.replace(options.strip as RegExp, '');
			});
		}
		if (options?.level) {
			return [matches[options.level]];
		} else {
			return matches;
		}
	}

	private stdout(key: LevelEnum, stack: string[], data: unknown[]): void {
		const path = Array.isArray(stack) ? stack.join('\n') : stack;
		switch (key) {
			case LevelEnum.LOG:
				process.stdout.write(
					`${ColorEnum.BG_GREEN} LOG ${ColorEnum.RESET} ${ColorEnum.FG_WHITE}${ColorEnum.UNDERSCORE}${path}${ColorEnum.RESET} `,
				);
				break;
			case LevelEnum.INFO:
				process.stdout.write(
					`${ColorEnum.BG_BLUE} INF ${ColorEnum.RESET} ${ColorEnum.FG_WHITE}${ColorEnum.UNDERSCORE}${path}${ColorEnum.RESET} `,
				);
				break;
			case LevelEnum.WARN:
				process.stdout.write(
					`${ColorEnum.BG_YELLOW} WRN ${ColorEnum.RESET} ${ColorEnum.FG_WHITE}${ColorEnum.UNDERSCORE}${path}${ColorEnum.RESET} `,
				);
				break;
			case LevelEnum.ERROR:
				process.stdout.write(
					`${ColorEnum.BG_RED} ERR ${ColorEnum.RESET} ${ColorEnum.FG_WHITE}${ColorEnum.UNDERSCORE}${path}${ColorEnum.RESET} `,
				);
				break;
			case LevelEnum.DEBUG:
				process.stdout.write(
					`${ColorEnum.BG_WHITE} DEBUG ${ColorEnum.RESET}\n${ColorEnum.FG_WHITE}${ColorEnum.UNDERSCORE}${path}${ColorEnum.RESET}\n`,
				);
				break;
			default:
				process.stdout.write(
					`${ColorEnum.BG_WHITE}${ColorEnum.FG_BLACK} DEFAULT ${ColorEnum.RESET} ${ColorEnum.FG_WHITE}${ColorEnum.UNDERSCORE}${path}${ColorEnum.RESET} `,
				);
		}
		data.forEach((item) => {
			if (item instanceof Error) {
				process.stdout.write(
					`\n${ColorEnum.BG_MAGENTA} ${item.name} ${ColorEnum.RESET} ${ColorEnum.BG_BLACK} ${item.message} ${ColorEnum.RESET} `,
				);
				process.stdout.write(util.inspect(this.trace(item), true, null, true));
			} else {
				process.stdout.write(util.inspect(item, true, null, true));
			}
			process.stdout.write(' ');
		});
		process.stdout.write('\n');
	}
}

export const Debug = DebugHelper.getInstance();
