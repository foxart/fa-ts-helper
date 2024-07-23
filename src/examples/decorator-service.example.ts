import { DataHelper, DecoratorService } from '../index';
import { initConsole } from './index';

const Decorator = new DecoratorService('__FA_DECORATOR__');
const ClassDecorator = (metadata: string): ClassDecorator => {
  return Decorator.decorateClass((target) => {
    DecoratorService.setClassMetadata(Decorator.symbol, target, {
      data: metadata,
    });
  });
};
const Method = (metadata: string): MethodDecorator => {
  return Decorator.decorateMethod((target, propertyKey) => {
    DecoratorService.setMethodMetadata(Decorator.symbol, target, propertyKey, {
      data: metadata,
    });
  });
};
const Param1 = (metadata: string): ParameterDecorator => {
  return Decorator.decorateParameter((target, propertyKey, parameterIndex) => {
    DecoratorService.setParameterMetadata(Decorator.symbol, target, propertyKey, parameterIndex, {
      data: metadata,
      callback: (value, metadata) => {
        return `Param1/${value as string}`;
      },
    });
  });
};
const Param2 = (metadata: string): ParameterDecorator => {
  return Decorator.decorateParameter((target, propertyKey, parameterIndex) => {
    DecoratorService.setParameterMetadata(Decorator.symbol, target, propertyKey, parameterIndex, {
      data: metadata,
      callback: (value, metadata) => {
        return `Param2/${value as string}`;
      },
    });
  });
};

class TestClass {
  @Method('Method1')
  public testMethod(
    @Param1('Param1')
    @Param2('Param2')
    param1: unknown,
    @Param1('Param3')
    param2?: unknown,
  ): { param1: unknown; param2: unknown } {
    const result = { param1, param2 };
    console.warn(`${this.constructor.name}->${this.testMethod.name}()`, { param1, param2 });
    return result;
  }
}

export function DecoratorServiceExample(): void {
  initConsole();
  const mock = new TestClass();
  const data = {
    param1: DataHelper.randomFloat(1, 10),
    param2: DataHelper.randomString(10),
  };
  const result = mock.testMethod(data.param1, data.param2);
  console.log(result);
}
