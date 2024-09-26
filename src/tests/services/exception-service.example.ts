import { ExceptionService } from '../../index';

export function run(): void {
  try {
    // @ts-ignore
    a = 1;
  } catch (err: unknown) {
    const exceptionHelper = new ExceptionService({
      short: true,
      callback: (stack: string[]): string[] => {
        return stack.filter((item) => {
          return item.indexOf('node_modules/@nestjs') !== -1 || item.indexOf('node_modules') === -1;
        });
      },
    });
    // const result = exceptionHelper.parse(new mongoose.mongo.MongoError('XXX'));
    const result = exceptionHelper.parse(err);
    console.log(result);
  }
}
