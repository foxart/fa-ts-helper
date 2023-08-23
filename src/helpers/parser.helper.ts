import path from 'path';

type TraceCallbackType = (item: string[]) => string[];

interface TraceOptionsInterface {
	short?: boolean;
	level?: number | null;
	callback?: TraceCallbackType | TraceCallbackType[];
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
			if (Array.isArray(options.callback)) {
				options.callback.forEach((callback) => {
					result = callback(result);
				});
			} else {
				result = options.callback(result);
			}
		}
		if (options?.level) {
			return [result[options.level]];
		} else {
			return result;
		}
	}
}

export const Parser = ParserHelper.getInstance();
