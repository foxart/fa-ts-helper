import { ConsoleClass, ConsoleLevelEnum, ConsoleServiceOptionsInterface } from '../classes/console.class';
import { ErrorClass } from '../classes/error.class';
import { ColorHelper } from '../helpers/color.helper';

const { foreground, effect } = ColorHelper;

export class NestConsoleService extends ConsoleClass {
  public constructor(options: ConsoleServiceOptionsInterface) {
    super(options);
  }

  public override print(level: ConsoleLevelEnum, trace: string[], args: unknown[]): void {
    const [message, context, ...data] = args;
    this.printCounter();
    this.printName(level);
    this.printDate();
    this.processStdout(context as string);
    this.processStdout(' ');
    this.processStdout(ColorHelper.wrapData(message as string, [this.getForeground(level)]));
    this.processStdout(' ');
    data.forEach((item) => {
      if (item instanceof Error) {
        this.processStdout(this.colorWrapper(item.name, [effect.BOLD, foreground.CYAN]));
        this.processStdout(this.colorWrapper(': ', foreground.RED));
        if (item instanceof ErrorClass) {
          this.processStdout(item.message);
          if (item.details) {
            this.processStdout(' ');
            this.processStdout(this.dataWrapper(item.details));
          }
        } else {
          this.processStdout(item.message);
        }
        this.processStdout(' ');
      } else {
        this.processStdout(this.dataWrapper(item));
        this.processStdout(' ');
      }
    });
    if (trace.length) {
      this.processStdout(this.colorWrapper('{', [effect.DIM, this.getForeground(level)]));
      trace.forEach((item) => {
        this.processStdout('\n');
        this.processStdout(this.colorWrapper(' at ', [effect.DIM, this.getForeground(level)]));
        this.processStdout(item);
      });
      this.processStdout(`\n${this.colorWrapper('}', [effect.DIM, this.getForeground(level)])}`);
      this.processStdout(' ');
    }
    this.printPerformance();
    this.processStdout('\n');
  }
}
