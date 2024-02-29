import * as util from 'util';
import * as process from 'process';
import { ColorHelperEnum, ConsoleColorHelper as cch } from './console-color.helper';
import { ParserHelper } from './parser.helper';

enum LevelEnum {
	LOG,
	INFO,
	WARN,
	ERROR,
	DEBUG,
}

interface OptionsInterface {
	info?: boolean;
	link?: boolean;
	node_modules?: boolean;
	depth?: null | number;
	hidden?: boolean;
	color?: boolean;
}

class ConsoleSingleton {
	private static self: ConsoleSingleton;

	public readonly console: Console;

	private options: OptionsInterface;

	private constructor() {
		this.options = {
			link: true,
			info: false,
			node_modules: false,
			depth: null,
			hidden: true,
			color: true,
		};
		// this.pathRegexp = /.+\/(.+):([0-9]+):[0-9]+/;
		this.console = Object.assign({}, console);
	}

	public static getInstance(): ConsoleSingleton {
		if (!ConsoleSingleton.self) {
			ConsoleSingleton.self = new ConsoleSingleton();
		}
		return ConsoleSingleton.self;
	}

	public override(options?: OptionsInterface): void {
		this.options = { ...this.options, ...options };
		console.log = this.log.bind(this);
		console.info = this.info.bind(this);
		console.warn = this.warn.bind(this);
		console.error = this.error.bind(this);
		console.debug = this.debug.bind(this);
	}

	public restore(): void {
		console.log = this.console.log.bind(this);
		console.info = this.console.info.bind(this);
		console.warn = this.console.warn.bind(this);
		console.error = this.console.error.bind(this);
		console.debug = this.console.debug.bind(this);
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
				this.stdout(this.colorize([' LOG '], this.levelColors(level)));
				this.stdoutData(data);
				this.stdoutLink(stack[0], this.levelColors(level));
				break;
			case LevelEnum.INFO:
				this.stdout(this.colorize([' INF '], this.levelColors(level)));
				this.stdoutData(data);
				this.stdoutLink(stack[0], this.levelColors(level));
				break;
			case LevelEnum.WARN:
				this.stdout(this.colorize([' WRN '], this.levelColors(level)));
				this.stdoutData(data);
				this.stdoutLink(stack[0], this.levelColors(level));
				break;
			case LevelEnum.ERROR:
				this.stdout(this.colorize([' ERR '], this.levelColors(level)));
				this.stdoutData(data);
				this.stdoutLink(stack[0], this.levelColors(level));
				break;
			case LevelEnum.DEBUG:
				this.stdout(this.colorize([' DEBUG '], this.levelColors(level)));
				this.stdout('\n');
				this.stdout(this.colorize(['DATA:'], [cch.color.magenta]));
				this.stdoutData(data);
				this.stdout('\n');
				this.stdout(this.colorize(['TRACE: '], [cch.color.magenta]));
				this.stdoutStack(stack);
				this.stdout('\n');
				this.stdoutLink(stack[0], this.levelColors(level));
				break;
			default:
				this.stdout(this.colorize([' DEFAULT '], this.levelColors(level)));
				this.stdoutData(data);
				this.stdoutLink(stack[0], this.levelColors(level));
		}
		this.stdout('\n');
	}

	private stdout(data: string): void {
		process.stdout.write(data);
	}

	private stdoutData(data: unknown[]): void {
		data.forEach((item) => {
			if (item instanceof Error) {
				this.stdout(this.colorize([' ', item.name], [cch.effect.bright]));
				this.stdout(this.colorize([':'], [cch.effect.dim]));
				this.stdout(this.colorize([' ', item.message, ' '], [cch.color.red, cch.effect.bright]));
				this.stdoutStack(this.callerPath(item, null, true));
			} else {
				this.stdout(' ');
				this.stdout(
					util.inspect(item, {
						showHidden: this.options?.hidden,
						depth: this.options?.depth,
						colors: this.options?.color,
					}),
				);
			}
		});
	}

	private stdoutLink(link?: string, colors?: ColorHelperEnum[]): void {
		if (link) {
			if (this.options?.link) {
				this.stdout('\n');
				this.stdout(this.colorize([' at '], colors || []));
				this.stdout(' ');
				this.stdout(link);
			}
			this.stdout('\n');
		}
	}

	private stdoutStack(stack: string[]): void {
		this.stdout('{');
		stack.forEach((item) => {
			this.stdout('\n');
			this.stdout(this.colorize([' at '], [cch.color.white]));
			this.stdout(item);
		});
		this.stdout('\n}');
	}

	private colorize(data: string[], colors: ColorHelperEnum[]): string {
		const result = colors.reduce(
			(acc, value) => {
				return `${value}${acc}`;
			},
			Array.isArray(data) ? data.join('') : data,
		);
		return `${cch.effect.reset}${result}${cch.effect.reset}`;
	}

	private levelColors(level?: LevelEnum): ColorHelperEnum[] {
		switch (level) {
			case LevelEnum.LOG:
				return [cch.background.green];
			case LevelEnum.INFO:
				return [cch.background.blue];
			case LevelEnum.WARN:
				return [cch.background.yellow];
			case LevelEnum.ERROR:
				return [cch.background.red];
			case LevelEnum.DEBUG:
				return [cch.background.magenta, cch.effect.bright];
			default:
				return [cch.background.gray];
		}
	}
}

export const ConsoleHelper = ConsoleSingleton.getInstance();
