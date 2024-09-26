import * as process from 'process';
import * as util from 'util';
import { ColorHelper, ColorHelperEnum } from '../helpers/color.helper';
import { ParserHelper } from '../helpers/parser.helper';
import { ErrorService } from './error.service';

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
  stackShow?: boolean;
  stackFull?: boolean;
  /** utils */
  dataColor?: boolean;
  dataType?: boolean;
  dataSort?: boolean;
}

export class ConsoleService {
  public readonly console: Console;

  public readonly stackIndex: number;

  private readonly performance: number;

  private counter: number;

  public constructor(private readonly options: ConsoleServiceOptionsInterface) {
    this.counter = 0;
    this.performance = performance.now();
    this.stackIndex = options.stackIndex || 1;
    this.console = Object.assign({}, console);
  }

  public log(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack);
      this.print(LevelEnum.LOG, stack[this.stackIndex], data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public info(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack);
      this.print(LevelEnum.INF, stack[this.stackIndex], data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public warn(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack);
      this.print(LevelEnum.WRN, stack[this.stackIndex], data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public error(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack);
      this.print(LevelEnum.ERR, stack[this.stackIndex], data);
    } catch (e) {
      this.console.error(e);
    }
  }

  public debug(...data: unknown[]): void {
    try {
      const stack = ParserHelper.stack(new Error().stack);
      this.print(LevelEnum.DBG, stack[this.stackIndex], data);
    } catch (e) {
      this.console.error(e);
    }
  }

  protected print(level: LevelEnum, stack: string, args: unknown[]): void {
    this.printInfo(level);
    this.printCounter();
    this.printName(level);
    this.printDate();
    args.forEach((item) => {
      if (item instanceof Error) {
        this.processStdout(this.colorWrapper(item.name, [effect.bright, foreground.cyan]));
        this.processStdout(this.colorWrapper(': ', this.getForeground(level)));
        if (item.message) {
          if (item instanceof ErrorService) {
            this.processStdout(this.dataWrapper(item.message));
          } else {
            this.processStdout(this.colorWrapper(item.message, [effect.reset, foreground.white]));
          }
          this.processStdout(' ');
        }
        if (this.options.stackShow) {
          this.printStack(level, ParserHelper.stack(item.stack, { full: this.options.stackFull }));
        }
      } else {
        this.processStdout(this.dataWrapper(item));
        this.processStdout(' ');
      }
    });
    if (level === LevelEnum.DBG) {
      this.printStack(level, ParserHelper.stack(new Error().stack, { full: this.options.stackFull }));
    }
    this.printPerformance();
    this.printLink(level, stack);
    this.processStdout('\n');
  }

  protected printCounter(): void {
    if (this.options.counter) {
      this.counter++;
      this.processStdout(this.colorWrapper(this.counter.toString(), foreground.cyan));
      this.processStdout(this.colorWrapper('/', foreground.white));
    }
  }

  protected printDate(): void {
    if (this.options.date) {
      this.processStdout(
        this.colorWrapper(new Date().toISOString().replace(/T/, ' ').replace(/Z/, ''), [effect.dim, foreground.cyan]),
      );
      this.processStdout(' ');
    }
  }

  protected printInfo(level: LevelEnum): void {
    const info = Object.keys(LevelEnum as object)[Object.values(LevelEnum as object).indexOf(level)];
    if (this.options.info) {
      this.processStdout(this.colorWrapper(` ${info} `, this.getBackground(level)));
      this.processStdout(' ');
    }
  }

  protected printLink(level: LevelEnum, link: string): void {
    if (this.options.link) {
      this.processStdout('\n');
      if (this.options.info) {
        this.processStdout(this.colorWrapper(' at ', this.getBackground(level)));
        this.processStdout(' ');
      }
      this.processStdout(link);
    }
  }

  protected printName(level: LevelEnum): void {
    if (this.options.name) {
      this.processStdout(this.colorWrapper('[', [effect.bright, this.getForeground(level)]));
      this.processStdout(this.colorWrapper(this.options.name, [effect.dim, this.getForeground(level)]));
      this.processStdout(this.colorWrapper(']', [effect.bright, this.getForeground(level)]));
      this.processStdout(' ');
    }
  }

  protected printPerformance(): void {
    if (this.options.performance) {
      this.processStdout(this.colorWrapper('+', [effect.dim, foreground.cyan]));
      this.processStdout(
        this.colorWrapper(Math.floor(performance.now() - this.performance).toString(), foreground.cyan),
      );
      this.processStdout(this.colorWrapper('ms', [effect.dim, foreground.cyan]));
      this.processStdout(' ');
    }
  }

  protected printStack(level: LevelEnum, stack: string[]): void {
    if (this.options.stackShow) {
      this.processStdout(this.colorWrapper('{', [effect.dim, this.getForeground(level)]));
      stack.forEach((item) => {
        this.processStdout('\n');
        if (this.options.info) {
          this.processStdout(this.colorWrapper(' at ', [effect.dim, this.getForeground(level)]));
        } else {
          this.processStdout('    ');
        }
        this.processStdout(item);
      });
      this.processStdout(`\n${this.colorWrapper('}', [effect.dim, this.getForeground(level)])}`);
      this.processStdout(' ');
    }
  }

  protected getBackground(level: LevelEnum): ColorHelperEnum {
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

  protected getForeground(level: LevelEnum): ColorHelperEnum {
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

  protected colorWrapper(data: string, colors: ColorHelperEnum | ColorHelperEnum[]): string {
    if (!this.options.color) {
      return Array.isArray(data) ? data.join('') : data;
    }
    return ColorHelper.wrapData(data, colors);
  }

  protected dataWrapper(data: unknown): string {
    return util.inspect(data, {
      colors: this.options.color && this.options.dataColor,
      showHidden: this.options.dataType,
      sorted: this.options.dataSort,
      depth: null,
    });
  }

  protected processStdout(data: string): void {
    // process.stdout.write(effect.reset);
    process.stdout.write(data);
  }
}
