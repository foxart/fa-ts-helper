import * as process from 'process';
import * as util from 'util';
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
  /** console */
  color?: boolean;
  info?: boolean;
  counter?: boolean;
  name?: string;
  date?: boolean;
  performance?: boolean;
  link?: boolean;
  /** trace */
  stackIndex?: number;
  stackDebug?: boolean;
  stackDebugFull?: boolean;
  stackErrorFull?: boolean;
  /** utils */
  dataColor?: boolean;
  dataType?: boolean;
  dataSort?: boolean;
}

export class ConsoleService {
  public readonly console: Console;

  public readonly stackIndex: number;

  private counter: number;

  private readonly performance: number;

  // private readonly infoLength: number;
  public constructor(private readonly options: ConsoleServiceOptionsInterface) {
    this.stackIndex = options.stackIndex || 1;
    this.counter = 0;
    this.performance = performance.now();
    // this.infoLength = Math.max(...Object.keys(LevelEnum as object).map((item) => item.length));
    this.console = Object.assign({}, console);
  }

  public log(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { full: true });
      this.print(LevelEnum.LOG, stack[this.stackIndex], data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public info(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { full: true });
      this.print(LevelEnum.INF, stack[this.stackIndex], data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public warn(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { full: true });
      this.print(LevelEnum.WRN, stack[this.stackIndex], data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public error(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { full: true });
      this.print(LevelEnum.ERR, stack[this.stackIndex], data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public debug(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack, { full: true });
      this.print(LevelEnum.DBG, stack[this.stackIndex], data);
    } catch (e) {
      this.console.error(e);
    }
  }

  protected print(level: LevelEnum, stack: string, args: unknown[]): void {
    if (level === LevelEnum.DBG) {
      this.printInfo(level);
      this.printCounter();
      this.printName(level);
      this.printDate();
      this.printArgs(level, args);
      if (this.options.stackDebug) {
        this.printStack(level, ParserHelper.stack(new Error().stack, { full: this.options.stackDebugFull }));
      }
      this.printPerformance();
      this.printLink(level, stack);
    } else {
      this.printInfo(level);
      this.printCounter();
      this.printName(level);
      this.printDate();
      this.printArgs(level, args);
      this.printPerformance();
      this.printLink(level, stack);
    }
    this.processStdout('\n');
  }

  protected printArgs(level: LevelEnum, args: unknown[]): void {
    args.forEach((item) => {
      if (item instanceof Error) {
        this.processStdout(this.wrapData(item.name, effect.bright));
        this.processStdout(this.wrapData(': ', effect.dim));
        if (item.message) {
          this.processStdout(this.wrapData(item.message, foreground.red));
          this.processStdout(' ');
        }
        this.printStack(level, ParserHelper.stack(item.stack, { full: this.options.stackErrorFull }));
      } else {
        this.processStdout(
          util.inspect(item, {
            colors: this.options.color && this.options.dataColor,
            showHidden: this.options.dataType,
            sorted: this.options.dataSort,
            depth: null,
          }),
        );
        this.processStdout(' ');
      }
    });
  }

  protected printCounter(): void {
    if (this.options.counter) {
      this.counter++;
      this.processStdout(this.wrapData(this.counter.toString(), foreground.cyan));
      this.processStdout(this.wrapData('/', foreground.white));
    }
  }

  protected printDate(): void {
    if (this.options.date) {
      this.processStdout(
        this.wrapData(new Date().toISOString().replace(/T/, ' ').replace(/Z/, ''), [effect.dim, foreground.cyan]),
      );
      this.processStdout(' ');
    }
  }

  protected printInfo(level: LevelEnum): void {
    if (this.options.info) {
      const info = Object.keys(LevelEnum as object)[Object.values(LevelEnum as object).indexOf(level)];
      this.processStdout(this.wrapData(` ${info} `, this.background(level)));
      // this.stdout(''.padEnd(this.infoLength - info.length, ' '));
      this.processStdout(' ');
    }
  }

  protected printLink(level: LevelEnum, link: string): void {
    if (this.options.link) {
      this.processStdout('\n');
      if (this.options.info) {
        this.processStdout(this.wrapData(' at ', this.background(level)));
        this.processStdout(' ');
      }
      this.processStdout(link);
    }
  }

  protected printName(level: LevelEnum): void {
    if (this.options.name) {
      this.processStdout(this.wrapData('[', this.foreground(level)));
      this.processStdout(this.wrapData(this.options.name, [effect.dim, this.foreground(level)]));
      this.processStdout(this.wrapData(']', this.foreground(level)));
      this.processStdout(' ');
    }
  }

  protected printPerformance(): void {
    if (this.options.performance) {
      this.processStdout(this.wrapData('+', [effect.dim, foreground.cyan]));
      this.processStdout(this.wrapData(Math.floor(performance.now() - this.performance).toString(), foreground.cyan));
      this.processStdout(this.wrapData('ms', [effect.dim, foreground.cyan]));
      this.processStdout(' ');
    }
  }

  protected printStack(level: LevelEnum, stack: string[]): void {
    this.processStdout(this.wrapData('{', [effect.bright, foreground.blue]));
    stack.forEach((item) => {
      this.processStdout('\n');
      this.processStdout(this.wrapData(' at ', [effect.dim, this.foreground(level)]));
      this.processStdout(item);
    });
    this.processStdout(`\n${this.wrapData('}', [effect.bright, foreground.blue])}`);
    this.processStdout(' ');
  }

  private wrapData(data: string, colors: ColorHelperEnum | ColorHelperEnum[]): string {
    if (!this.options.color) {
      return Array.isArray(data) ? data.join('') : data;
    }
    return ColorHelper.wrapData(data, colors);
  }

  private processStdout(data: string): void {
    process.stdout.write(effect.reset);
    process.stdout.write(data);
  }

  private background(level: LevelEnum): ColorHelperEnum {
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

  private foreground(level: LevelEnum): ColorHelperEnum {
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
