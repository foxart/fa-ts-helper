import { LoggerService } from '@nestjs/common';
import { ConsoleService } from './console.service';
import { ColorHelper as cch, ColorHelperEnum } from '../helper/color.helper';

export class NestLoggerService implements LoggerService {
  private readonly console: ConsoleService;

  public constructor(name: string) {
    this.console = new ConsoleService({
      counter: true,
      date: false,
      name: name,
      info: false,
      performance: true,
      link: false,
      stack: false,
    });
  }

  public log(message: unknown, context: string, ...args: unknown[]): void {
    this.console.log(
      this.colorize(context, cch.foreground.green),
      this.colorize(message, cch.foreground.white),
      ...args,
    );
  }

  public info(message: unknown, context: string, ...args: unknown[]): void {
    this.console.info(
      this.colorize(context, cch.foreground.blue),
      this.colorize(message, cch.foreground.white),
      ...args,
    );
  }

  public warn(message: unknown, context: string, ...args: unknown[]): void {
    this.console.warn(
      this.colorize(context, cch.foreground.yellow),
      this.colorize(message, cch.foreground.white),
      ...args,
    );
  }

  public error(message: unknown, context: string, ...args: unknown[]): void {
    this.console.error(
      this.colorize(context, cch.foreground.red),
      this.colorize(message, cch.foreground.white),
      ...args,
    );
  }

  public debug(message: unknown, context: string, ...args: unknown[]): void {
    this.console.debug(
      this.colorize(context, cch.foreground.magenta),
      this.colorize(message, cch.foreground.white),
      ...args,
    );
  }

  public inspect(data: unknown): string {
    return this.console.inspect(data);
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
