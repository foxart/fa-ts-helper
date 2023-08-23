import * as util from 'util';
import { HelperConsoleColor, HelperParser } from '../index';

enum LevelEnum {
	LOG,
	INFO,
	WARN,
	ERROR,
	DEBUG,
}

interface DebugOptionsInterface {
	link?: boolean;
	path?: boolean;
	short?: boolean;
	hidden?: boolean;
	depth?: null | number;
	color?: boolean;
}

class DebugHelper {
	private static self: DebugHelper;
	public readonly console: Console;
	private options: DebugOptionsInterface;
	private readonly cc: typeof HelperConsoleColor;
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
		this.cc = HelperConsoleColor;
		this.console = Object.assign({}, console);
	}
	public static getInstance(): DebugHelper {
		if (!DebugHelper.self) {
			DebugHelper.self = new DebugHelper();
		}
		return DebugHelper.self;
	}

	public overwriteConsole(options?: DebugOptionsInterface): void {
		this.options = { ...this.options, ...options };
		console.log = this.log.bind(this);
		console.info = this.info.bind(this);
		console.warn = this.warn.bind(this);
		console.error = this.error.bind(this);
		console.debug = this.debug.bind(this);
	}

	public log(...data: unknown[]): void {
		this.beautify(LevelEnum.LOG, this.callerPath(new Error(), 1), data);
	}

	public info(...data: unknown[]): void {
		this.beautify(LevelEnum.INFO, this.callerPath(new Error(), 1), data);
	}

	public warn(...data: unknown[]): void {
		this.beautify(LevelEnum.WARN, this.callerPath(new Error(), 1), data);
	}

	public error(...data: unknown[]): void {
		this.beautify(LevelEnum.ERROR, this.callerPath(new Error(), 1), data);
	}

	public debug(...data: unknown[]): void {
		this.beautify(LevelEnum.DEBUG, this.callerPath(new Error(), null, false), data);
	}

	public inspect(object: unknown, hidden?: boolean, depth?: number | null, colors?: boolean): string {
		return util.inspect(object, {
			showHidden: hidden ?? this.options?.hidden,
			depth: depth ?? this.options?.depth,
			colors: colors ?? this.options?.color,
		});
	}

	private callerPath(error: Error, level: number | null, short?: boolean): string[] {
		return HelperParser.errorStack(error.stack, {
			level,
			short: short ?? this.options?.short,
		});
	}

	private beautify(key: LevelEnum, stack: string[], data: unknown[]): void {
		switch (key) {
			case LevelEnum.LOG:
				this.printLink(stack[0]);
				this.print(this.cc.wrap(' LOG ', [this.cc.background.green]));
				this.printPath(stack[0]);
				this.printData(data);
				break;
			case LevelEnum.INFO:
				this.printLink(stack[0]);
				this.print(this.cc.wrap(' INF ', [this.cc.background.blue]));
				this.printPath(stack[0]);
				this.printData(data);
				break;
			case LevelEnum.WARN:
				this.printLink(stack[0]);
				this.print(this.cc.wrap(' WRN ', [this.cc.background.yellow]));
				this.printPath(stack[0]);
				this.printData(data);
				break;
			case LevelEnum.ERROR:
				this.printLink(stack[0]);
				this.print(this.cc.wrap(' ERR ', [this.cc.background.red]));
				this.printPath(stack[0]);
				this.printData(data);
				break;
			case LevelEnum.DEBUG:
				this.print(this.cc.wrap([' >>> DEBUG '], [this.cc.background.magenta, this.cc.effect.bright]));
				this.print('\n');
				this.print(this.cc.wrap('DATA:', [this.cc.color.magenta, this.cc.effect.dim]));
				this.printData(data);
				this.print('\n');
				this.print(this.cc.wrap('TRACE: ', [this.cc.color.magenta, this.cc.effect.dim]));
				this.printPathStack(stack);
				this.print('\n');
				this.print(this.cc.wrap(' DEBUG <<< ', [this.cc.background.magenta, this.cc.effect.bright]));
				break;
			default:
				this.printLink(stack[0]);
				this.print(this.cc.wrap(' DEFAULT ', [this.cc.background.gray]));
				this.printPath(stack[0]);
				this.printData(data);
		}
		this.print('\n\n');
	}

	private print(data: string): void {
		process.stdout.write(data);
	}

	private printData(data: unknown[]): void {
		data.forEach((item) => {
			if (item instanceof Error) {
				this.print(this.cc.wrap(` ${item.name}:`, [this.cc.effect.bright]));
				this.print(this.cc.wrap(` ${item.message} `, [this.cc.color.red, this.cc.effect.bright]));
				this.printPathStack(this.callerPath(item, null, false));
			} else {
				this.print(' ');
				this.print(this.inspect(item));
			}
		});
	}

	private printLink(link: string): void {
		if (this.options?.link) {
			this.print(link);
			this.print('\n');
		}
	}

	private printPath(path: string): void {
		if (this.options?.path) {
			const match = path.match(this.pathRegexp);
			if (match) {
				this.print(this.cc.wrap(' at ', [this.cc.color.cyan]));
				this.print(this.cc.wrap(match[1], [this.cc.color.white]));
				this.print(this.cc.wrap(':', [this.cc.color.white, this.cc.effect.dim]));
				this.print(this.cc.wrap(match[2], [this.cc.color.cyan, this.cc.effect.dim]));
			} else {
				this.print(this.cc.wrap(path, [this.cc.color.white]));
			}
		}
	}

	private printPathStack(stack: string[]): void {
		this.print('{');
		stack.forEach((item) => {
			this.print('\n');
			this.print(this.cc.wrap(' at ', [this.cc.color.white, this.cc.effect.dim]));
			this.print(this.cc.wrap(item, [this.cc.color.white, this.cc.effect.dim, this.cc.effect.underscore]));
		});
		this.print('\n}');
	}
}

export const Debug = DebugHelper.getInstance();
