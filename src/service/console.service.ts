import * as util from 'util';
import * as process from 'process';
import { ColorHelperEnum, ColorHelper } from '../helper/color.helper';
import { ParserHelper } from '../helper/parser.helper';

const { foreground, background, effect } = ColorHelper;

enum LevelEnum {
  LOG,
  INF,
  WRN,
  ERR,
  DBG,
}

export interface ConsoleServiceOptionsInterface {
  info?: boolean;
  name?: string;
  counter?: boolean;
  performance?: boolean;
  date?: boolean;
  link?: boolean;
  stack?: boolean;
  index?: number;
  color?: boolean;
  hidden?: boolean;
}

export class ConsoleService {
  public readonly console: Console;
  private readonly options: ConsoleServiceOptionsInterface;
  private counter: number;
  private readonly performance: number;

  // private readonly infoLength: number;
  public constructor(options?: ConsoleServiceOptionsInterface) {
    this.options = {
      info: options?.info ?? true,
      name: options?.name,
      counter: options?.counter ?? false,
      performance: options?.performance ?? false,
      date: options?.date ?? false,
      link: options?.link ?? true,
      stack: options?.stack ?? true,
      index: options?.index ?? 1,
      color: options?.color ?? true,
      hidden: options?.hidden ?? false,
    };
    this.counter = 0;
    this.performance = performance.now();
    // this.infoLength = Math.max(...Object.keys(LevelEnum as object).map((item) => item.length));
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
      this.print(LevelEnum.INF, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public warn(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { index: this.options.index, short: true });
      this.print(LevelEnum.WRN, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public error(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { index: this.options.index, short: true });
      this.print(LevelEnum.ERR, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public debug(...data: unknown[]): void {
    try {
      const [, ...stack] = ParserHelper.stack(new Error().stack, { short: true });
      this.print(LevelEnum.DBG, stack, data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public inspect(data: unknown): string {
    return util.inspect(data, {
      showHidden: this.options.hidden,
      depth: null,
      colors: this.options.color,
    });
  }

  public stdout(data: string): void {
    process.stdout.write(effect.reset);
    process.stdout.write(data);
  }

  private print(level: LevelEnum, stack: string[], args: unknown[]): void {
    if (level === LevelEnum.DBG) {
      this.stdoutInfo(level);
      this.stdoutCounter();
      this.stdoutDate();
      this.stdoutName(level);
      this.stdoutArgs(args);
      this.stdoutPerformance();
      if (this.options.stack) {
        this.stdout('\n');
        this.stdout(this.colorize('stack', foreground.white));
        this.stdout(' ');
        this.stdoutStack(stack);
      }
      this.stdoutLink(level, stack[0]);
    } else {
      this.stdoutInfo(level);
      this.stdoutCounter();
      this.stdoutDate();
      this.stdoutName(level);
      this.stdoutArgs(args);
      this.stdoutPerformance();
      this.stdoutLink(level, stack[0]);
    }
    this.stdout('\n');
  }

  private stdoutInfo(level: LevelEnum): void {
    if (this.options.info) {
      const info = Object.keys(LevelEnum as object)[Object.values(LevelEnum as object).indexOf(level)];
      this.stdout(this.colorize([' ', info, ' '], this.backgroundFromLevel(level)));
      // this.stdout(''.padEnd(this.infoLength - info.length, ' '));
      this.stdout(' ');
    }
  }

  private stdoutCounter(): void {
    if (this.options.counter) {
      this.counter++;
      this.stdout(this.colorize(this.counter.toString(), foreground.cyan));
      this.stdout(this.colorize('/', foreground.white));
    }
  }

  private stdoutDate(): void {
    if (this.options.date) {
      this.stdout(
        this.colorize(new Date().toISOString().replace(/T/, ' ').replace(/Z/, ''), [effect.dim, foreground.cyan]),
      );
      this.stdout(' ');
    }
  }

  private stdoutName(level: LevelEnum): void {
    if (this.options.name) {
      this.stdout(this.colorize('[', foreground.cyan));
      this.stdout(this.colorize(this.options.name, [effect.dim, this.foregroundFromLevel(level)]));
      this.stdout(this.colorize(']', foreground.cyan));
      this.stdout(' ');
    }
  }

  private stdoutArgs(args: unknown[]): void {
    args.forEach((item) => {
      if (item instanceof Error) {
        this.stdout(this.colorize(item.name, [effect.bright, foreground.red]));
        this.stdout(this.colorize(': ', effect.dim));
        if (item.message) {
          this.stdout(this.colorize(item.message, foreground.red));
          this.stdout(' ');
        }
        this.stdoutStack(ParserHelper.stack(item.stack, { short: true }));
      } else {
        this.stdout(this.inspect(item));
      }
      this.stdout(' ');
    });
  }

  private stdoutPerformance(): void {
    if (this.options.performance) {
      this.stdout(this.colorize('+', [effect.dim, foreground.cyan]));
      this.stdout(this.colorize(Math.floor(performance.now() - this.performance).toString(), foreground.cyan));
      this.stdout(this.colorize('ms', [effect.dim, foreground.cyan]));
      this.stdout(' ');
    }
  }

  private stdoutLink(level: LevelEnum, link: string): void {
    if (this.options.link) {
      this.stdout('\n');
      if (this.options.info) {
        this.stdout(this.colorize(' at ', this.backgroundFromLevel(level)));
        this.stdout(' ');
      }
      this.stdout(link);
    }
  }

  private stdoutStack(stack: string[]): void {
    this.stdout('{');
    stack.forEach((item) => {
      this.stdout('\n');
      this.stdout(this.colorize(' at ', foreground.white));
      this.stdout(item);
    });
    this.stdout('\n}');
  }

  private colorize(data: string | string[], colors: ColorHelperEnum | ColorHelperEnum[]): string {
    if (!this.options.color) {
      return Array.isArray(data) ? data.join('') : data;
    }
    return ColorHelper.colorize(data, colors);
  }

  private backgroundFromLevel(level?: LevelEnum): ColorHelperEnum {
    switch (level) {
      case LevelEnum.LOG:
        return background.green;
      case LevelEnum.INF:
        return background.blue;
      case LevelEnum.WRN:
        return background.yellow;
      case LevelEnum.ERR:
        return background.red;
      case LevelEnum.DBG:
        return background.magenta;
      default:
        return background.gray;
    }
  }

  private foregroundFromLevel(level?: LevelEnum): ColorHelperEnum {
    switch (level) {
      case LevelEnum.LOG:
        return foreground.green;
      case LevelEnum.INF:
        return foreground.blue;
      case LevelEnum.WRN:
        return foreground.yellow;
      case LevelEnum.ERR:
        return foreground.red;
      case LevelEnum.DBG:
        return foreground.magenta;
      default:
        return foreground.gray;
    }
  }
}
