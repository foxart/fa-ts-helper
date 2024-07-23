export enum ColorHelperEnum {
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
  SYMBOL_SUCCESS = '\u2714',
  SYMBOL_ERROR = '\u2716',
}

interface EffectInterface {
  reset: ColorHelperEnum.RESET;
  bright: ColorHelperEnum.BRIGHT;
  dim: ColorHelperEnum.DIM;
  underscore: ColorHelperEnum.UNDERSCORE;
  blink: ColorHelperEnum.BLINK;
  reverse: ColorHelperEnum.REVERSE;
  hidden: ColorHelperEnum.HIDDEN;
}

interface ForegroundInterface {
  black: ColorHelperEnum.FG_BLACK;
  red: ColorHelperEnum.FG_RED;
  green: ColorHelperEnum.FG_GREEN;
  yellow: ColorHelperEnum.FG_YELLOW;
  blue: ColorHelperEnum.FG_BLUE;
  magenta: ColorHelperEnum.FG_MAGENTA;
  cyan: ColorHelperEnum.FG_CYAN;
  white: ColorHelperEnum.FG_WHITE;
  gray: ColorHelperEnum.FG_GRAY;
}

interface BackgroundInterface {
  black: ColorHelperEnum.BG_BLACK;
  red: ColorHelperEnum.BG_RED;
  green: ColorHelperEnum.BG_GREEN;
  yellow: ColorHelperEnum.BG_YELLOW;
  blue: ColorHelperEnum.BG_BLUE;
  magenta: ColorHelperEnum.BG_MAGENTA;
  cyan: ColorHelperEnum.BG_CYAN;
  white: ColorHelperEnum.BG_WHITE;
  gray: ColorHelperEnum.BG_GRAY;
}

interface SymbolInterface {
  success: ColorHelperEnum.SYMBOL_SUCCESS;
  error: ColorHelperEnum.SYMBOL_ERROR;
}

class ConsoleColorSingleton {
  private static self: ConsoleColorSingleton;
  public readonly effect: EffectInterface;
  public readonly foreground: ForegroundInterface;
  public readonly background: BackgroundInterface;
  public readonly symbol: SymbolInterface;

  private constructor() {
    this.effect = {
      reset: ColorHelperEnum.RESET,
      bright: ColorHelperEnum.BRIGHT,
      dim: ColorHelperEnum.DIM,
      underscore: ColorHelperEnum.UNDERSCORE,
      blink: ColorHelperEnum.BLINK,
      reverse: ColorHelperEnum.REVERSE,
      hidden: ColorHelperEnum.HIDDEN,
    };
    this.foreground = {
      black: ColorHelperEnum.FG_BLACK,
      red: ColorHelperEnum.FG_RED,
      green: ColorHelperEnum.FG_GREEN,
      yellow: ColorHelperEnum.FG_YELLOW,
      blue: ColorHelperEnum.FG_BLUE,
      magenta: ColorHelperEnum.FG_MAGENTA,
      cyan: ColorHelperEnum.FG_CYAN,
      white: ColorHelperEnum.FG_WHITE,
      gray: ColorHelperEnum.FG_GRAY,
    };
    this.background = {
      black: ColorHelperEnum.BG_BLACK,
      red: ColorHelperEnum.BG_RED,
      green: ColorHelperEnum.BG_GREEN,
      yellow: ColorHelperEnum.BG_YELLOW,
      blue: ColorHelperEnum.BG_BLUE,
      magenta: ColorHelperEnum.BG_MAGENTA,
      cyan: ColorHelperEnum.BG_CYAN,
      white: ColorHelperEnum.BG_WHITE,
      gray: ColorHelperEnum.BG_GRAY,
    };
    this.symbol = {
      success: ColorHelperEnum.SYMBOL_SUCCESS,
      error: ColorHelperEnum.SYMBOL_ERROR,
    };
  }

  public static getInstance(): ConsoleColorSingleton {
    if (!ConsoleColorSingleton.self) {
      ConsoleColorSingleton.self = new ConsoleColorSingleton();
    }
    return ConsoleColorSingleton.self;
  }

  public colorize(data: string | string[], colors: ColorHelperEnum | ColorHelperEnum[]): string {
    const result = (Array.isArray(colors) ? colors : [colors]).reduce(
      (acc, value) => {
        return `${value}${acc}`;
      },
      Array.isArray(data) ? data.join('') : data,
    );
    return `${this.effect.reset}${result}${this.effect.reset}`;
  }
}

export const ColorHelper = ConsoleColorSingleton.getInstance();
