import * as util from 'util';
import * as process from 'process';
import { ConsoleColorHelper } from './console-color.helper';
import { ParserHelper } from './parser.helper';

enum LevelEnum {
	LOG,
	INFO,
	WARN,
	ERROR,
	DEBUG,
}

interface OptionsInterface {
	link?: boolean;
	path?: boolean;
	short?: boolean;
	hidden?: boolean;
	depth?: null | number;
	color?: boolean;
}

class ConsoleSingleton {
	private static self: ConsoleSingleton;
	public readonly console: Console;
	private options: OptionsInterface;
	private readonly consoleColor: typeof ConsoleColorHelper;
	private readonly pathRegexp: RegExp;

	private constructor() {
		this.options = {
			link: true,
			path: true,
			short: false,
			hidden: true,
			depth: null,
			color: true,
		};
		this.pathRegexp = /.+\/(.+):([0-9]+):[0-9]+/;
		this.consoleColor = ConsoleColorHelper;
		this.console = Object.assign({}, console);
	}

	public static getInstance(): ConsoleSingleton {
		if (!ConsoleSingleton.self) {
			ConsoleSingleton.self = new ConsoleSingleton();
		}
		return ConsoleSingleton.self;
	}

	public overwriteConsole(options?: OptionsInterface): void {
		this.options = { ...this.options, ...options };
		console.log = this.log.bind(this);
		console.info = this.info.bind(this);
		console.warn = this.warn.bind(this);
		console.error = this.error.bind(this);
		console.debug = this.debug.bind(this);
	}

	public log(...data: unknown[]): void {
		try {
			this.print(LevelEnum.LOG, this.callerPath(new Error(), 1), data);
		} catch (e) {
			this.console.error(e);
		}
	}

	public info(...data: unknown[]): void {
		try {
			this.print(LevelEnum.INFO, this.callerPath(new Error(), 1), data);
		} catch (e) {
			this.console.error(e);
		}
	}

	public warn(...data: unknown[]): void {
		try {
			this.print(LevelEnum.WARN, this.callerPath(new Error(), 1), data);
		} catch (e) {
			this.console.error(e);
		}
	}

	public error(...data: unknown[]): void {
		try {
			this.print(LevelEnum.ERROR, this.callerPath(new Error(), 1), data);
		} catch (e) {
			this.console.error(e);
		}
	}

	public debug(...data: unknown[]): void {
		try {
			this.print(LevelEnum.DEBUG, this.callerPath(new Error(), null, false), data);
		} catch (e) {
			this.console.error(e);
		}
	}

	public inspect(object: unknown, hidden?: boolean, depth?: number | null, colors?: boolean): string {
		return util.inspect(object, {
			showHidden: hidden ?? this.options?.hidden,
			depth: depth ?? this.options?.depth,
			colors: colors ?? this.options?.color,
		});
	}

	private callerPath(error: Error, level: number | null, short?: boolean): string[] {
		return ParserHelper.stack(error.stack, {
			level,
			short: short ?? this.options?.short,
		});
	}

	private print(key: LevelEnum, stack: string[], data: unknown[]): void {
		switch (key) {
			case LevelEnum.LOG:
				this.stdout(this.consoleColor.wrap(' LOG ', [this.consoleColor.background.green]));
				this.stdoutPath(stack[0]);
				this.stdoutData(data);
				this.stdoutLink(stack[0]);
				break;
			case LevelEnum.INFO:
				this.stdout(this.consoleColor.wrap(' INF ', [this.consoleColor.background.blue]));
				this.stdoutPath(stack[0]);
				this.stdoutData(data);
				this.stdoutLink(stack[0]);
				break;
			case LevelEnum.WARN:
				this.stdout(this.consoleColor.wrap(' WRN ', [this.consoleColor.background.yellow]));
				this.stdoutPath(stack[0]);
				this.stdoutData(data);
				this.stdoutLink(stack[0]);
				break;
			case LevelEnum.ERROR:
				this.stdout(this.consoleColor.wrap(' ERR ', [this.consoleColor.background.red]));
				this.stdoutPath(stack[0]);
				this.stdoutData(data);
				this.stdoutLink(stack[0]);
				break;
			case LevelEnum.DEBUG:
				this.stdout(
					this.consoleColor.wrap(
						[' >>> DEBUG '],
						[this.consoleColor.background.magenta, this.consoleColor.effect.bright],
					),
				);
				this.stdout('\n');
				this.stdout(
					this.consoleColor.wrap('DATA:', [this.consoleColor.color.magenta, this.consoleColor.effect.dim]),
				);
				this.stdoutData(data);
				this.stdout('\n');
				this.stdout(
					this.consoleColor.wrap('TRACE: ', [this.consoleColor.color.magenta, this.consoleColor.effect.dim]),
				);
				this.stdoutPathStack(stack);
				this.stdout('\n');
				this.stdout(
					this.consoleColor.wrap(' DEBUG <<< ', [
						this.consoleColor.background.magenta,
						this.consoleColor.effect.bright,
					]),
				);
				this.stdoutLink(stack[0]);
				break;
			default:
				this.stdoutLink(stack[0]);
				this.stdout(this.consoleColor.wrap(' DEFAULT ', [this.consoleColor.background.gray]));
				this.stdoutPath(stack[0]);
				this.stdoutData(data);
		}
		this.stdout('\n');
	}

	private stdout(data: string): void {
		process.stdout.write(data);
	}

	private stdoutData(data: unknown[]): void {
		data.forEach((item) => {
			if (item instanceof Error) {
				this.stdout(this.consoleColor.wrap(` ${item.name}:`, [this.consoleColor.effect.bright]));
				this.stdout(
					this.consoleColor.wrap(` ${item.message} `, [
						this.consoleColor.color.red,
						this.consoleColor.effect.bright,
					]),
				);
				this.stdoutPathStack(this.callerPath(item, null, false));
			} else {
				this.stdout(' ');
				this.stdout(this.inspect(item));
			}
		});
	}

	private stdoutLink(link: string): void {
		if (this.options?.link) {
			this.stdout('\n');
			this.stdout(link);
		}
		this.stdout('\n');
	}

	private stdoutPath(path: string): void {
		if (this.options?.path) {
			const match = path.match(this.pathRegexp);
			if (match) {
				this.stdout(this.consoleColor.wrap(' at ', [this.consoleColor.color.cyan]));
				this.stdout(this.consoleColor.wrap(match[1], [this.consoleColor.color.white]));
				this.stdout(this.consoleColor.wrap(':', [this.consoleColor.color.white, this.consoleColor.effect.dim]));
				this.stdout(
					this.consoleColor.wrap(match[2], [this.consoleColor.color.cyan, this.consoleColor.effect.dim]),
				);
			} else {
				this.stdout(this.consoleColor.wrap(path, [this.consoleColor.color.white]));
			}
		}
	}

	private stdoutPathStack(stack: string[]): void {
		this.stdout('{');
		stack.forEach((item) => {
			this.stdout('\n');
			this.stdout(this.consoleColor.wrap(' at ', [this.consoleColor.color.white, this.consoleColor.effect.dim]));
			this.stdout(
				this.consoleColor.wrap(item, [
					this.consoleColor.color.white,
					this.consoleColor.effect.dim,
					this.consoleColor.effect.underscore,
				]),
			);
		});
		this.stdout('\n}');
	}
}

export const ConsoleHelper = ConsoleSingleton.getInstance();
