import { ConsoleHelper, DecoratorHelper } from '../../src';

const Console = new ConsoleHelper({ info: false, link: false });
const Decorator = new DecoratorHelper('__FA_DECORATOR__');
/**
 *
 */
const ClassDecorator = (metadata: string): ClassDecorator => {
  return Decorator.decorateClass((target) => {
    DecoratorHelper.setClassMetadata(Decorator.symbol, target, metadata);
    // console.warn('ClassDecorator', { data, classMetadata });
    // Console.stdout('\n');
  });
};
const MethodDecorator = (metadata: string): MethodDecorator => {
  return Decorator.decorateMethod((target, propertyKey) => {
    DecoratorHelper.setMethodMetadata(Decorator.symbol, target, propertyKey, metadata);
    const classMetadata = DecoratorHelper.getClassMetadata(Decorator.symbol, target);
    console.warn('MethodDecorator', { data: metadata, classMetadata });
    Console.stdout('\n');
    // console.log({ value, metadata: metadata.classData });
    // return [`${value} method`];
    // return [`${value}-method`];
  });
};
const ParamDecorator = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter(data, (value: string, metadata): unknown => {
    // const classMetadata = DecoratorHelper.getClassMetadata(Decorator.symbol, target);
    console.warn('ParamDecorator', metadata.classData, metadata.methodData, data);
    Console.stdout('\n');
    return `${data}-${value}`;
  });
};

export function testDecorator(): void {
  const mock = new MockClass();
  const result = mock.testParam('value1', 'value2');
  console.log(result);
  Console.stdout('\n');
}

@ClassDecorator('ClassData')
class MockClass {
  @MethodDecorator('MethodData')
  public testParam(
    // @ParamDecorator('param1Data') @ParamDecorator('param2Data')
    param1: string,
    @ParamDecorator('param2Data') param2?: string,
    // param2: string,
  ): { param1: string; param2: unknown } {
    const result = { param1, param2 };
    console.info(`${this.constructor.name}->${this.testParam.name}(${param1}, ${param2})`);
    Console.stdout('\n');
    return result;
  }
}
