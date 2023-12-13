import * as util from 'util';
import * as process from 'process';
import { ColorHelperEnum, ConsoleColorHelper } from './console-color.helper';
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
	node_modules?: boolean;
	depth?: null | number;
	hidden?: boolean;
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
			node_modules: false,
			depth: null,
			hidden: true,
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
			this.print(LevelEnum.LOG, this.callerPath(new Error(), 1, true), data);
		} catch (e) {
			this.console.error(e);
		}
	}

	public info(...data: unknown[]): void {
		try {
			this.print(LevelEnum.INFO, this.callerPath(new Error(), 1, true), data);
		} catch (e) {
			this.console.error(e);
		}
	}

	public warn(...data: unknown[]): void {
		try {
			this.print(LevelEnum.WARN, this.callerPath(new Error(), 1, true), data);
		} catch (e) {
			this.console.error(e);
		}
	}

	public error(...data: unknown[]): void {
		try {
			this.print(LevelEnum.ERROR, this.callerPath(new Error(), 1, true), data);
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
			showHidden: hidden || this.options?.hidden,
			depth: depth || this.options?.depth,
			colors: colors || this.options?.color,
		});
	}

	public colorize(data: string | string[], colors: ColorHelperEnum[]): string {
		const result = colors.reduce(
			(acc, value) => {
				return `${value}${acc}`;
			},
			Array.isArray(data) ? data.join('') : data,
		);
		return `${this.consoleColor.effect.reset}${result}${this.consoleColor.effect.reset}`;
	}

	public levelColors(level?: LevelEnum): ColorHelperEnum[] {
		switch (level) {
			case LevelEnum.LOG:
				return [this.consoleColor.background.green];
			case LevelEnum.INFO:
				return [this.consoleColor.background.blue];
			case LevelEnum.WARN:
				return [this.consoleColor.background.yellow];
			case LevelEnum.ERROR:
				return [this.consoleColor.background.red];
			case LevelEnum.DEBUG:
				return [this.consoleColor.background.magenta, this.consoleColor.effect.bright];
			default:
				return [];
		}
	}

	private callerPath(error: Error, index: number | null, short?: boolean): string[] {
		return ParserHelper.stack(error.stack, {
			index,
			short,
			callback: this.options?.node_modules
				? undefined
				: (stack): string[] => {
						return stack.filter((item) => {
							return item.indexOf('node_modules') === -1;
						});
				  },
		});
	}

	private print(level: LevelEnum, stack: string[], data: unknown[]): void {
		switch (level) {
			case LevelEnum.LOG:
				this.stdout(this.colorize(' LOG ', this.levelColors(level)));
				this.stdoutPath(stack[0]);
				this.stdoutData(data);
				this.stdoutLink(stack[0], LevelEnum.LOG);
				break;
			case LevelEnum.INFO:
				this.stdout(this.colorize(' INF ', this.levelColors(level)));
				this.stdoutPath(stack[0]);
				this.stdoutData(data);
				this.stdoutLink(stack[0], LevelEnum.INFO);
				break;
			case LevelEnum.WARN:
				this.stdout(this.colorize(' WRN ', this.levelColors(level)));
				this.stdoutPath(stack[0]);
				this.stdoutData(data);
				this.stdoutLink(stack[0], LevelEnum.WARN);
				break;
			case LevelEnum.ERROR:
				this.stdout(this.colorize(' ERR ', this.levelColors(level)));
				this.stdoutPath(stack[0]);
				this.stdoutData(data);
				this.stdoutLink(stack[0], LevelEnum.ERROR);
				break;
			case LevelEnum.DEBUG:
				this.stdout(this.colorize([' >>> DEBUG '], this.levelColors(level)));
				this.stdout('\n');
				this.stdout(this.colorize('DATA:', [this.consoleColor.color.magenta, this.consoleColor.effect.dim]));
				this.stdoutData(data);
				this.stdout('\n');
				this.stdout(this.colorize('TRACE: ', [this.consoleColor.color.magenta, this.consoleColor.effect.dim]));
				this.stdoutPathStack(stack);
				this.stdout('\n');
				this.stdout(
					this.colorize(' DEBUG <<< ', [
						this.consoleColor.background.magenta,
						this.consoleColor.effect.bright,
					]),
				);
				this.stdoutLink(stack[0], LevelEnum.DEBUG);
				break;
			default:
				this.stdoutLink(stack[0]);
				this.stdout(this.colorize(' DEFAULT ', [this.consoleColor.background.gray]));
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
				this.stdout(this.colorize(` ${item.name}`, [this.consoleColor.effect.bright]));
				this.stdout(this.colorize(':', [this.consoleColor.effect.dim]));
				this.stdout(
					this.colorize(` ${item.message} `, [this.consoleColor.color.red, this.consoleColor.effect.bright]),
				);
				this.stdoutPathStack(this.callerPath(item, null, true));
			} else {
				this.stdout(' ');
				this.stdout(this.inspect(item));
			}
		});
	}

	private stdoutLink(link: string, level?: LevelEnum): void {
		if (this.options?.link) {
			this.stdout('\n');
			this.stdout(this.colorize(' at ', this.levelColors(level)));
			this.stdout(' ');
			this.stdout(link);
		}
		this.stdout('\n');
	}

	private stdoutPath(path: string): void {
		if (this.options?.path) {
			const match = path.match(this.pathRegexp);
			if (match) {
				// this.stdout(this.consoleColor.wrap(' at ', [this.consoleColor.color.white]));
				this.stdout(` ${match[1]}`);
				this.stdout(this.colorize(':', [this.consoleColor.color.white]));
				this.stdout(this.colorize(match[2], [this.consoleColor.color.cyan]));
			} else {
				this.stdout(this.colorize(path, [this.consoleColor.color.white]));
			}
		}
	}

	private stdoutPathStack(stack: string[]): void {
		this.stdout('{');
		stack.forEach((item) => {
			this.stdout('\n');
			this.stdout(this.colorize(' at ', [this.consoleColor.color.white]));
			this.stdout(item);
		});
		this.stdout('\n}');
	}
}

export const ConsoleHelper = ConsoleSingleton.getInstance();
