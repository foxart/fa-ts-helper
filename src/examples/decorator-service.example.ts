import { DataHelper, DecoratorService } from '../index';
import { initConsole } from './index';

const Decorator = new DecoratorService('__FA_DECORATOR__');
const ClassDecorator = (data: string): ClassDecorator => {
  // Decorator.
  // return Decorator.decorateClass((target) => {
  //   console.log('CLASS', { target });
  //   Decorator.setClassMetadata(target, {
  //     data: data,
  //   });
  // });
  return Decorator.decorateClass(() => {
    return {
      data: data,
    };
  });
};
const Method = (data: string): MethodDecorator => {
  // return Decorator.decorateMethod((target, propertyKey) => {
  return Decorator.decorateMethod(() => {
    // Decorator.setMethodMetadata(target, propertyKey, {
    //   data: data,
    //   before: (metadata, ...args) => {
    //     console.log('BEFORE', { metadata });
    //     return args;
    //   },
    // });
    return {
      data: data,
      before: (metadata, ...args): unknown[] => {
        console.log('BEFORE', { metadata });
        return args;
      },
    };
  });
};
const Param1 = (data: string): ParameterDecorator => {
  // return Decorator.decorateParameter((target, propertyKey, parameterIndex) => {
  return Decorator.decorateParameter(() => {
    // Decorator.setParameterMetadata(target, propertyKey, parameterIndex, {
    return {
      data: data,
      callback: (metadata, arg): unknown => {
        console.log('PARAM', { metadata });
        return `Param1/${arg as string}`;
      },
    };
  });
};
// const Param2 = (data: string): ParameterDecorator => {
//   return Decorator.decorateParameter((target, propertyKey, parameterIndex) => {
//     Decorator.setParameterMetadata(target, propertyKey, parameterIndex, {
//       data: data,
//       callback: (value, metadata) => {
//         return `Param2/${value as string}`;
//       },
//     });
//   });
// };
class MainClass {}

class BaseClass extends MainClass {}

@ClassDecorator('xxx')
class TestClass extends BaseClass {
  @Method('Method1')
  public testMethod(
    @Param1('Param1') // @Param2('Param2')
    param1: unknown,
    // @Param1('Param2')
    param2?: unknown,
  ): { param1: unknown; param2: unknown } {
    const result = { param1, param2 };
    // console.warn(`${this.constructor.name}->${this.testMethod.name}()`, { param1, param2 });
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
