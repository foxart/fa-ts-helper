import { DecoratorService } from '../../src';

const Decorator = new DecoratorService('__FA_DECORATOR__');
/**
 *
 */
const ClassDecorator = (metadata: string): ClassDecorator => {
  return Decorator.decorateClass((target) => {
    DecoratorService.setClassMetadata(Decorator.symbol, target, {
      data: metadata,
    });
    // console.warn('ClassDecorator', metadata);
    // Console.stdout('\n');
  });
};
const MethodDecorator = (metadata: string): MethodDecorator => {
  return Decorator.decorateMethod((target, propertyKey) => {
    DecoratorService.setMethodMetadata(Decorator.symbol, target, propertyKey, {
      data: metadata,
      // before: (metadata, ...args) => {
      //   console.warn('BEFORE', args);
      //   return args.map((item) => {
      //     return (item as number) + 1;
      //   });
      // },
      // after: (metadata, ...args) => {
      //   console.warn('AFTER', args);
      //   return args.map((item) => {
      //     return `${item as string}<---`;
      //   });
      // },
    });
  });
};
const ParamDecorator = (metadata: string): ParameterDecorator => {
  return Decorator.decorateParameter((target, propertyKey, parameterIndex) => {
    DecoratorService.setParameterMetadata(Decorator.symbol, target, propertyKey, parameterIndex, {
      data: metadata,
      callback: (value, metadata) => {
        // console.warn(metadata);
        // const classMetadata = DecoratorHelper.getClassMetadata(Decorator.symbol, target);
        // const methodMetadata = DecoratorHelper.getMethodMetadata(Decorator.symbol, target, propertyKey);
        // const parameterMetadata = DecoratorHelper.getParameterMetadata(Decorator.symbol, target, propertyKey);
        // console.warn('ParamDecorator', classMetadata, methodMetadata, parameterMetadata.get(parameterIndex));
        // console.warn('ParamDecorator', metadata);
        return `${value as string}/${metadata.parameterData as string}`;
      },
    });
  });
};

export function decoratorExample(): void {
  const mock = new TestClass();
  const data = {
    param1: 1,
    param2: 2,
  };
  mock.testMethod(data.param1, data.param2);
  const result = mock.testMethod(data.param1, data.param2);
  console.log({ result });
}

// @ClassDecorator('Class1')
class TestClass {
  @MethodDecorator('Method1')
  public testMethod(
    @ParamDecorator('Param1')
    @ParamDecorator('Param2')
    param1: unknown,
    @ParamDecorator('Param3')
    param2?: unknown,
    // param2: unknown,
  ): { param1: unknown; param2: unknown } {
    const result = { param1, param2 };
    console.info(`${this.constructor.name}->${this.testMethod.name}()`, { param1, param2 });
    return result;
  }
}
