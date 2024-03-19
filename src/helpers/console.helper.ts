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
  level?: number;
  link?: boolean;
  hidden?: boolean;
  color?: boolean;
}

class ConsoleSingleton {
  // private static self: ConsoleSingleton;
  public readonly console: Console;
  private readonly options: OptionsInterface;

  public constructor(options?: OptionsInterface) {
    this.options = {
      level: options?.level ?? 1,
      link: options?.link ?? true,
      hidden: options?.hidden ?? false,
      color: options?.color ?? true,
    };
    this.console = Object.assign({}, console);
  }

  // public static getInstance(): ConsoleSingleton {
  //   if (!ConsoleSingleton.self) {
  //     ConsoleSingleton.self = new ConsoleSingleton();
  //   }
  //   return ConsoleSingleton.self;
  // }
  public log(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { index: this.options.level, short: true });
      this.print(LevelEnum.LOG, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public info(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { index: this.options.level, short: true });
      this.print(LevelEnum.INFO, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public warn(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { index: this.options.level, short: true });
      this.print(LevelEnum.WARN, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public error(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { index: this.options.level, short: true });
      this.print(LevelEnum.ERROR, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public debug(...data: unknown[]): void {
    try {
      const [, ...stack] = ParserHelper.stack(new Error().stack);
      this.print(LevelEnum.DEBUG, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public stdout(data: string): void {
    process.stdout.write(data);
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
        this.stdoutLink(stack[0], this.levelColors(level));
        break;
      default:
        this.stdout(this.colorize([' DEFAULT '], this.levelColors(level)));
        this.stdoutData(data);
        this.stdoutLink(stack[0], this.levelColors(level));
    }
    this.stdout('\n');
  }

  private stdoutData(data: unknown[]): void {
    data.forEach((item) => {
      if (item instanceof Error) {
        this.stdout(this.colorize([' ', item.name], [cch.effect.bright]));
        this.stdout(this.colorize([':'], [cch.effect.dim]));
        this.stdout(this.colorize([' ', item.message, ' '], [cch.color.red, cch.effect.bright]));
        this.stdoutStack(ParserHelper.stack(item.stack, { short: true }));
      } else {
        this.stdout(' ');
        this.stdout(
          util.inspect(item, {
            showHidden: this.options?.hidden,
            depth: null,
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
    if (!this.options.color) {
      return Array.isArray(data) ? data.join('') : data;
    }
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

// export const ConsoleHelper = ConsoleSingleton.getInstance();
export { ConsoleSingleton as ConsoleHelper };
