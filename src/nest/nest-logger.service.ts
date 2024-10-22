import { LoggerService } from '@nestjs/common';
import { ConsoleLevelEnum } from '../classes/console.class';
import { ParserHelper } from '../helpers/parser.helper';
import { NestConsoleService } from './nest-console.service';

export class NestLoggerService implements LoggerService {
  public constructor(protected readonly nestConsoleService: NestConsoleService) {}

  public log(message: string, context: string, ...args: unknown[]): void {
    this.nestConsoleService.print(ConsoleLevelEnum.LOG, [], [message, context, ...args]);
  }

  public error(message: string, stack: string, context: string, ...args: unknown[]): void {
    this.nestConsoleService.print(
      ConsoleLevelEnum.ERR,
      ParserHelper.stack(stack).filter((item) => item.indexOf('node_modules') === -1),
      [message, context, ...args],
    );
  }

  public warn(message: string, context: string, ...args: unknown[]): void {
    this.nestConsoleService.print(ConsoleLevelEnum.WRN, [], [message, context, ...args]);
  }
}
