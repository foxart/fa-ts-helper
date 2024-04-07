import { ConsoleHelper, DecoratorHelper } from '../../src';

enum ClassEnum {
  METHOD_1 = 'ENUM-1',
  METHOD_2 = 'ENUM-2',
}

const Console = new ConsoleHelper({ info: false, link: false });
const Decorator = new DecoratorHelper('__FA_DECORATOR__');
/**
 *
 */
const ClassDecorator = (value: unknown): ClassDecorator => {
  return Decorator.decorateClass(value);
};
const ParamDecorator = (data: ClassEnum): ParameterDecorator => {
  return Decorator.decorateParameter((value, metadata): unknown => {
    console.warn(value, metadata.parameter.returntype.name);
    // const record = metadata.classData as Record<string, number>;
    // console.warn({ enum: { key: record[data], value: data } });
    // Console.stdout('\n');
    return `${value}-${data}`;
  });
};
const MethodDecorator = (data: unknown): MethodDecorator => {
  return Decorator.decorateMethod((...value) => {
    // console.info(this);
    // console.info(value);
    // Console.stdout('\n');
    // console.log({ value, metadata: metadata.classData });
    // return [`${value} method`];
    return [`${value}-method`];
  });
};

@ClassDecorator('ClassMetadata')
class MockClass {
  @MethodDecorator('MethodMetadata')
  // public test(@ParamDecorator(ClassEnum.METHOD_1) data: unknown): unknown {
  public test(
    @ParamDecorator(ClassEnum.METHOD_1) param1: string,
    // @ParamDecorator(ClassEnum.METHOD_2) param2?: unknown,
    param2: unknown,
  ): { param1: string; param2: unknown } {
    const result = { param1, param2 };
    Console.stdout('\n');
    console.info(`${this.constructor.name}->${this.test.name}`, { param1, param2 });
    Console.stdout('\n');
    return result;
  }
}

export function testDecorator(): void {
  const mock = new MockClass();
  const result = mock.test('test1Value', 'test2Value');
  Console.stdout('\n');
  console.log(result);
  Console.stdout('\n');
}
