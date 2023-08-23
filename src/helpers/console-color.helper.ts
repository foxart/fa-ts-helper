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

interface EffectInterface {
	reset: ColorEnum.RESET;
	bright: ColorEnum.BRIGHT;
	dim: ColorEnum.DIM;
	underscore: ColorEnum.UNDERSCORE;
	blink: ColorEnum.BLINK;
	reverse: ColorEnum.REVERSE;
	hidden: ColorEnum.HIDDEN;
}

interface ColorInterface {
	black: ColorEnum.FG_BLACK;
	red: ColorEnum.FG_RED;
	green: ColorEnum.FG_GREEN;
	yellow: ColorEnum.FG_YELLOW;
	blue: ColorEnum.FG_BLUE;
	magenta: ColorEnum.FG_MAGENTA;
	cyan: ColorEnum.FG_CYAN;
	white: ColorEnum.FG_WHITE;
	gray: ColorEnum.FG_GRAY;
}

interface BackgroundInterface {
	black: ColorEnum.BG_BLACK;
	red: ColorEnum.BG_RED;
	green: ColorEnum.BG_GREEN;
	yellow: ColorEnum.BG_YELLOW;
	blue: ColorEnum.BG_BLUE;
	magenta: ColorEnum.BG_MAGENTA;
	cyan: ColorEnum.BG_CYAN;
	white: ColorEnum.BG_WHITE;
	gray: ColorEnum.BG_GRAY;
}

class ConsoleColorHelper {
	private static self: ConsoleColorHelper;
	public readonly effect: EffectInterface;
	public readonly color: ColorInterface;
	public readonly background: BackgroundInterface;

	private constructor() {
		this.effect = {
			reset: ColorEnum.RESET,
			bright: ColorEnum.BRIGHT,
			dim: ColorEnum.DIM,
			underscore: ColorEnum.UNDERSCORE,
			blink: ColorEnum.BLINK,
			reverse: ColorEnum.REVERSE,
			hidden: ColorEnum.HIDDEN,
		};
		this.color = {
			black: ColorEnum.FG_BLACK,
			red: ColorEnum.FG_RED,
			green: ColorEnum.FG_GREEN,
			yellow: ColorEnum.FG_YELLOW,
			blue: ColorEnum.FG_BLUE,
			magenta: ColorEnum.FG_MAGENTA,
			cyan: ColorEnum.FG_CYAN,
			white: ColorEnum.FG_WHITE,
			gray: ColorEnum.FG_GRAY,
		};
		this.background = {
			black: ColorEnum.BG_BLACK,
			red: ColorEnum.BG_RED,
			green: ColorEnum.BG_GREEN,
			yellow: ColorEnum.BG_YELLOW,
			blue: ColorEnum.BG_BLUE,
			magenta: ColorEnum.BG_MAGENTA,
			cyan: ColorEnum.BG_CYAN,
			white: ColorEnum.BG_WHITE,
			gray: ColorEnum.BG_GRAY,
		};
	}

	public static getInstance(): ConsoleColorHelper {
		if (!ConsoleColorHelper.self) {
			ConsoleColorHelper.self = new ConsoleColorHelper();
		}
		return ConsoleColorHelper.self;
	}

	public wrap(data: string | string[], effects: ColorEnum[]): string {
		const result = effects.reduce(
			(acc, value) => {
				return `${value}${acc}`;
			},
			Array.isArray(data) ? data.join('') : data,
		);
		return `${this.effect.reset}${result}${this.effect.reset}`;
	}
}

export const ConsoleColor = ConsoleColorHelper.getInstance();
