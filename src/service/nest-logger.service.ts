import { LoggerService } from '@nestjs/common';
import { ConsoleService, ConsoleServiceOptionsInterface } from './console.service';
import { ColorHelper as cch, ColorHelperEnum } from '../helper/color.helper';
import util from 'util';

export class NestLoggerService implements LoggerService {
  private readonly console: ConsoleService;

  public constructor(options?: ConsoleServiceOptionsInterface) {
    this.console = new ConsoleService(options);
    this.console.inspect = (data: unknown): string => {
      return typeof data === 'string'
        ? data
        : util.inspect(data, {
            showHidden: true,
            depth: null,
            colors: true,
          });
    };
  }

  public log(message: unknown, context: string, ...args: unknown[]): void {
    if (message) {
      this.console.log(
        this.colorize(context, [cch.effect.reset, cch.foreground.white]),
        this.colorize(message, cch.foreground.green),
        ...args,
      );
    } else {
      this.console.log(this.colorize(context, cch.foreground.green), ...args);
    }
  }

  public info(message: unknown, context: string, ...args: unknown[]): void {
    if (message) {
      this.console.info(
        this.colorize(context, [cch.effect.reset, cch.foreground.white]),
        this.colorize(message, cch.foreground.blue),
        ...args,
      );
    } else {
      this.console.info(this.colorize(context, cch.foreground.blue), ...args);
    }
  }

  public warn(message: unknown, context: string, ...args: unknown[]): void {
    if (message) {
      this.console.warn(
        this.colorize(context, [cch.effect.reset, cch.foreground.white]),
        this.colorize(message, cch.foreground.yellow),
        ...args,
      );
    } else {
      this.console.warn(this.colorize(context, cch.foreground.yellow), ...args);
    }
  }

  public error(message: unknown, context: string, ...args: unknown[]): void {
    if (message) {
      this.console.error(
        this.colorize(context, [cch.effect.reset, cch.foreground.white]),
        this.colorize(message, cch.foreground.red),
        ...args,
      );
    } else {
      this.console.error(this.colorize(context, cch.foreground.red), ...args);
    }
  }

  public debug(message: unknown, context: string, ...args: unknown[]): void {
    if (message) {
      this.console.debug(
        this.colorize(context, [cch.effect.reset, cch.foreground.white]),
        this.colorize(message, [cch.effect.dim, cch.foreground.magenta]),
        ...args,
      );
    } else {
      this.console.debug(this.colorize(context, cch.foreground.magenta), ...args);
    }
  }

  public stout(data: string): void {
    this.console.stdout(data);
  }

  private colorize(data: unknown, colors: ColorHelperEnum | ColorHelperEnum[]): string | unknown {
    if (typeof data === 'string') {
      const result = (Array.isArray(colors) ? colors : [colors]).reduce((acc, value) => {
        return `${value}${acc}`;
      }, data);
      return `${cch.effect.reset}${result}${cch.effect.reset}`;
    }
    return data;
  }
}
