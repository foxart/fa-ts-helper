import * as util from 'util';
import * as process from 'process';
import { ColorHelperEnum, ColorHelper as cch } from '../helper/color.helper';
import { ParserHelper } from '../helper/parser.helper';
import { DataHelper } from '../helper/data.helper';

enum LevelEnum {
  LOG,
  INF,
  WRN,
  ERR,
  DBG,
}

interface OptionsInterface {
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
  private readonly options: OptionsInterface;
  private counter: number;
  private readonly performance: number;

  // private readonly infoLength: number;
  public constructor(options?: OptionsInterface) {
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
    return typeof data === 'string'
      ? data
      : util.inspect(data, {
          showHidden: this.options.hidden,
          depth: null,
          colors: this.options.color,
        });
  }

  public stdout(data: string): void {
    process.stdout.write(cch.effect.reset);
    process.stdout.write(data);
  }

  private print(level: LevelEnum, stack: string[], args: unknown[]): void {
    if (level === LevelEnum.DBG) {
      this.stdoutCounter();
      this.stdoutDate();
      this.stdoutName(level);
      this.stdoutInfo(level);
      this.stdoutArgs(args);
      this.stdoutPerformance();
      if (this.options.stack) {
        this.stdout('\n');
        this.stdout(this.colorize('stack', cch.foreground.white));
        this.stdout(' ');
        this.stdoutStack(stack);
      }
      this.stdoutLink(level, stack[0]);
    } else {
      this.stdoutCounter();
      this.stdoutDate();
      this.stdoutName(level);
      this.stdoutInfo(level);
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

  private stdoutName(level: LevelEnum): void {
    if (this.options.name) {
      this.stdout(this.colorize('[', this.foregroundFromLevel(level)));
      this.stdout(this.options.name);
      this.stdout(this.colorize(']', this.foregroundFromLevel(level)));
      this.stdout(' ');
    }
  }

  private stdoutCounter(): void {
    if (this.options.counter) {
      this.counter++;
      this.stdout(this.colorize(this.counter.toString(), cch.foreground.cyan));
      this.stdout(this.colorize('/', cch.foreground.white));
    }
  }

  private stdoutDate(): void {
    if (this.options.date) {
      this.stdout(
        this.colorize(new Date().toISOString().replace(/T/, ' ').replace(/Z/, ''), [
          cch.effect.dim,
          cch.foreground.cyan,
        ]),
      );
      this.stdout(' ');
    }
  }

  private stdoutPerformance(): void {
    if (this.options.performance) {
      this.stdout(this.colorize('+', [cch.effect.dim, cch.foreground.cyan]));
      this.stdout(this.colorize(Math.floor(performance.now() - this.performance).toString(), cch.foreground.cyan));
      this.stdout(this.colorize('ms', [cch.effect.dim, cch.foreground.cyan]));
      this.stdout(' ');
    }
  }

  private stdoutArgs(args: unknown[]): void {
    args.forEach((item) => {
      if (item instanceof Error) {
        this.stdout(this.colorize(item.name, cch.effect.bright));
        this.stdout(this.colorize(': ', cch.effect.dim));
        if (item.message) {
          this.stdout(this.colorize(item.message, [cch.effect.bright, cch.foreground.red]));
          this.stdout(' ');
        }
        this.stdoutStack(ParserHelper.stack(item.stack, { short: true }));
      } else {
        this.stdout(this.inspect(item));
      }
      this.stdout(' ');
    });
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
      this.stdout(this.colorize(' at ', cch.foreground.white));
      this.stdout(item);
    });
    this.stdout('\n}');
  }

  private colorize(data: string | string[], colors: ColorHelperEnum | ColorHelperEnum[]): string {
    if (!this.options.color) {
      return Array.isArray(data) ? data.join('') : data;
    }
    const result = (Array.isArray(colors) ? colors : [colors]).reduce(
      (acc, value) => {
        return `${value}${acc}`;
      },
      Array.isArray(data) ? data.join('') : data,
    );
    return `${cch.effect.reset}${result}${cch.effect.reset}`;
  }

  private backgroundFromLevel(level?: LevelEnum): ColorHelperEnum {
    switch (level) {
      case LevelEnum.LOG:
        return cch.background.green;
      case LevelEnum.INF:
        return cch.background.blue;
      case LevelEnum.WRN:
        return cch.background.yellow;
      case LevelEnum.ERR:
        return cch.background.red;
      case LevelEnum.DBG:
        return cch.background.magenta;
      default:
        return cch.background.gray;
    }
  }

  private foregroundFromLevel(level?: LevelEnum): ColorHelperEnum {
    switch (level) {
      case LevelEnum.LOG:
        return cch.foreground.green;
      case LevelEnum.INF:
        return cch.foreground.blue;
      case LevelEnum.WRN:
        return cch.foreground.yellow;
      case LevelEnum.ERR:
        return cch.foreground.red;
      case LevelEnum.DBG:
        return cch.foreground.magenta;
      default:
        return cch.foreground.gray;
    }
  }
}
