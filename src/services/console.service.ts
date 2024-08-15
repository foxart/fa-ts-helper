import * as util from 'util';
import * as process from 'process';
import { ColorHelper, ColorHelperEnum } from '../helpers/color.helper';
import { ParserHelper } from '../helpers/parser.helper';

const { foreground, background, effect } = ColorHelper;

export enum LevelEnum {
  LOG,
  INF,
  WRN,
  ERR,
  DBG,
}

export interface ConsoleServiceOptionsInterface {
  name?: string;
  info?: boolean;
  counter?: boolean;
  performance?: boolean;
  date?: boolean;
  link?: boolean;
  stack?: boolean;
  index?: number;
  /** util s*/
  color?: boolean;
  hidden?: boolean;
  sorted?: boolean;
}

export class ConsoleService {
  public readonly console: Console;
  private readonly options: ConsoleServiceOptionsInterface;
  private counter: number;
  private readonly performance: number;
  private readonly infoLength: number;

  public constructor(options?: ConsoleServiceOptionsInterface) {
    this.options = { ...options, index: options?.index ?? 1 };
    this.counter = 0;
    this.performance = performance.now();
    this.infoLength = Math.max(...Object.keys(LevelEnum as object).map((item) => item.length));
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
      colors: this.options.color,
      showHidden: this.options.hidden,
      sorted: this.options.sorted,
      depth: null,
    });
  }

  public stdout(data: string): void {
    process.stdout.write(effect.reset);
    process.stdout.write(data);
  }

  public backgroundFromLevel(level?: LevelEnum): ColorHelperEnum {
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

  public foregroundFromLevel(level?: LevelEnum): ColorHelperEnum {
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

  public colorize(data: string | string[], colors: ColorHelperEnum | ColorHelperEnum[]): string {
    if (!this.options.color) {
      return Array.isArray(data) ? data.join('') : data;
    }
    return ColorHelper.colorize(data, colors);
  }

  private print(level: LevelEnum, stack: string[], args: unknown[]): void {
    if (level === LevelEnum.DBG) {
      this.printInfo(level);
      this.printCounter();
      this.printName(level);
      this.printDate();
      this.printArgs(args);
      this.printPerformance();
      if (this.options.stack) {
        this.stdout('\n');
        this.stdout(this.colorize('stack', foreground.white));
        this.stdout(' ');
        this.printStack(stack);
      }
      this.printLink(level, stack[0]);
    } else {
      this.printInfo(level);
      this.printCounter();
      this.printName(level);
      this.printDate();
      this.printArgs(args);
      this.printPerformance();
      this.printLink(level, stack[0]);
    }
    this.stdout('\n');
  }

  private printInfo(level: LevelEnum): void {
    if (this.options.info) {
      const info = Object.keys(LevelEnum as object)[Object.values(LevelEnum as object).indexOf(level)];
      this.stdout(this.colorize([' ', info, ' '], this.backgroundFromLevel(level)));
      // this.stdout(''.padEnd(this.infoLength - info.length, ' '));
      this.stdout(' ');
    }
  }

  private printCounter(): void {
    if (this.options.counter) {
      this.counter++;
      this.stdout(this.colorize(this.counter.toString(), foreground.cyan));
      this.stdout(this.colorize('/', foreground.white));
    }
  }

  private printName(level: LevelEnum): void {
    if (this.options.name) {
      this.stdout(this.colorize('[', this.foregroundFromLevel(level)));
      this.stdout(this.colorize(this.options.name, [effect.dim, this.foregroundFromLevel(level)]));
      this.stdout(this.colorize(']', this.foregroundFromLevel(level)));
      this.stdout(' ');
    }
  }

  private printDate(): void {
    if (this.options.date) {
      this.stdout(
        this.colorize(new Date().toISOString().replace(/T/, ' ').replace(/Z/, ''), [effect.dim, foreground.cyan]),
      );
      this.stdout(' ');
    }
  }

  private printArgs(args: unknown[]): void {
    args.forEach((item) => {
      if (item instanceof Error) {
        this.stdout(this.colorize(item.name, [effect.bright, foreground.red]));
        this.stdout(this.colorize(': ', effect.dim));
        if (item.message) {
          this.stdout(this.colorize(item.message, foreground.red));
          this.stdout(' ');
        }
        this.printStack(ParserHelper.stack(item.stack, { short: true }));
      } else {
        this.stdout(this.inspect(item));
      }
      this.stdout(' ');
    });
  }

  private printPerformance(): void {
    if (this.options.performance) {
      this.stdout(this.colorize('+', [effect.dim, foreground.cyan]));
      this.stdout(this.colorize(Math.floor(performance.now() - this.performance).toString(), foreground.cyan));
      this.stdout(this.colorize('ms', [effect.dim, foreground.cyan]));
      this.stdout(' ');
    }
  }

  private printLink(level: LevelEnum, link: string): void {
    if (this.options.link) {
      this.stdout('\n');
      if (this.options.info) {
        this.stdout(this.colorize([' ', 'at', ' '], this.backgroundFromLevel(level)));
        this.stdout(' ');
      }
      this.stdout(link);
    }
  }

  private printStack(stack: string[]): void {
    this.stdout('{');
    stack.forEach((item) => {
      this.stdout('\n');
      this.stdout(this.colorize(' at ', foreground.white));
      this.stdout(item);
    });
    this.stdout('\n}');
  }
}
