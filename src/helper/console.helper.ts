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
  index?: number;
  date?: boolean;
  info?: boolean;
  link?: boolean;
  color?: boolean;
  hidden?: boolean;
}

export class ConsoleHelper {
  public readonly console: Console;
  private readonly options: OptionsInterface;

  public constructor(options?: OptionsInterface) {
    this.options = {
      index: options?.index ?? 1,
      date: options?.date ?? true,
      info: options?.info ?? true,
      link: options?.link ?? true,
      color: options?.color ?? true,
      hidden: options?.hidden ?? false,
    };
    this.console = Object.assign({}, console);
  }

  public log(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { index: this.options.index, short: true });
      this.print(LevelEnum.LOG, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public info(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { index: this.options.index, short: true });
      this.print(LevelEnum.INFO, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public warn(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { index: this.options.index, short: true });
      this.print(LevelEnum.WARN, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public error(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { index: this.options.index, short: true });
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

  public inspect(data: unknown): string {
    return util.inspect(data, { showHidden: this.options.hidden, depth: null, colors: this.options.color });
  }

  private print(level: LevelEnum, stack: string[], data: unknown[]): void {
    if (level === LevelEnum.DEBUG) {
      this.stdoutInfo(level);
      this.stdoutDate();
      this.stdoutData(data);
      this.stdout('\n');
      if (this.options.info) {
        this.stdout(this.colorize(['stack'], [cch.foreground.white]));
        this.stdout(' ');
      }
      this.stdoutStack(stack);
      this.stdoutLink(stack[0], this.backgroundColor(level));
    } else {
      this.stdoutInfo(level);
      this.stdoutDate();
      this.stdoutData(data);
      this.stdoutLink(stack[0], this.backgroundColor(level));
    }
    this.stdout('\n');
  }

  private stdoutInfo(level: LevelEnum): void {
    if (this.options.info) {
      const key = Object.keys(LevelEnum as object)[Object.values(LevelEnum as object).indexOf(level)];
      this.stdout(this.colorize([' ', key, ' '], this.backgroundColor(level)));
      this.stdout(' ');
    }
  }

  private stdoutDate(): void {
    if (this.options.date) {
      this.stdout(this.colorize(this.date(), [cch.foreground.cyan]));
      this.stdout(' ');
    }
  }

  private stdoutData(data: unknown[]): void {
    data.forEach((item) => {
      if (item instanceof Error) {
        this.stdout(this.colorize(item.name, [cch.effect.bright]));
        this.stdout(this.colorize(': ', [cch.effect.dim]));
        this.stdout(this.colorize(item.message, [cch.foreground.red, cch.effect.bright]));
        this.stdout(' ');
        this.stdoutStack(ParserHelper.stack(item.stack, { short: true }));
      } else {
        this.stdout(this.inspect(item));
        this.stdout(' ');
      }
    });
  }

  private stdoutLink(link?: string, colors?: ColorHelperEnum[]): void {
    if (this.options.link && link) {
      this.stdout('\n');
      if (this.options.info) {
        this.stdout(this.colorize(' at ', colors ?? []));
        this.stdout(' ');
      }
      this.stdout(link);
    }
  }

  private stdoutStack(stack: string[]): void {
    this.stdout('{');
    stack.forEach((item) => {
      this.stdout('\n');
      this.stdout(this.colorize(' at ', [cch.foreground.white]));
      this.stdout(item);
    });
    this.stdout('\n}');
  }

  private colorize(data: string | string[], colors: ColorHelperEnum[]): string {
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

  private date() {
    // return new Date().toLocaleString('en-GB', {
    //   year: 'numeric',
    //   month: '2-digit',
    //   day: '2-digit',
    //   hour: '2-digit',
    //   minute: '2-digit',
    //   second: '2-digit',
    //   hour12: false,
    // });
    return new Date().toISOString().replace(/T/, ' ').replace(/Z/, '');
  }

  private backgroundColor(level?: LevelEnum): ColorHelperEnum[] {
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
        return [cch.background.magenta];
      default:
        return [cch.background.gray];
    }
  }

  private foregroundColor(level?: LevelEnum): ColorHelperEnum[] {
    switch (level) {
      case LevelEnum.LOG:
        return [cch.foreground.green];
      case LevelEnum.INFO:
        return [cch.foreground.blue];
      case LevelEnum.WARN:
        return [cch.foreground.yellow];
      case LevelEnum.ERROR:
        return [cch.foreground.red];
      case LevelEnum.DEBUG:
        return [cch.foreground.magenta];
      default:
        return [cch.foreground.gray];
    }
  }
}
