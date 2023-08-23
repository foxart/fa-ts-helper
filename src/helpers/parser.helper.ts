import path from 'path';

interface TraceOptionsInterface {
	short?: boolean;
	level?: number | null;
	callback?: (item: string[]) => string[];
}

class ParserHelper {
	private static self: ParserHelper;
	private readonly cwd: string;
	private readonly errorStackRegexp: RegExp;

	private constructor() {
		this.cwd = process.cwd();
		this.errorStackRegexp = /\/(.+:\d+:\d+)/gm;
	}

	public static getInstance(): ParserHelper {
		if (!ParserHelper.self) {
			ParserHelper.self = new ParserHelper();
		}
		return ParserHelper.self;
	}

	public errorStack(stack?: string, options?: TraceOptionsInterface): string[] {
		if (!stack) {
			return [];
		}
		let result: string[] = [];
		let match = this.errorStackRegexp.exec(stack);
		while (match != null) {
			if (match[0].indexOf(this.cwd) !== -1) {
				result.push(match[0]);
			}
			match = this.errorStackRegexp.exec(stack);
		}
		if (options?.short) {
			result = result.map((item) => path.relative(this.cwd, item));
		}
		if (options?.callback) {
			result = options.callback(result);
		}
		if (options?.level) {
			return [result[options.level]];
		} else {
			return result;
		}
	}
}

export const Parser = ParserHelper.getInstance();
