import { DataHelper, DecoratorService } from '../index';
import { initConsole } from './index';

const Decorator = new DecoratorService('__FA_DECORATOR__');
const ClassDecorator = (data: string): ClassDecorator => {
  return Decorator.decorateClass(() => {
    return {
      data: data,
    };
  });
};
const Method = (data: string): MethodDecorator => {
  return Decorator.decorateMethod(() => {
    return {
      data: data,
      before: (metadata, ...args): unknown[] => {
        console.log('BEFORE', args);
        return args;
      },
      after: (metadata, ...args): unknown[] => {
        console.log('AFTER', args);
        return args;
      },
    };
  });
};
const Param1 = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter(() => {
    return {
      data: data,
      callback: (metadata, arg: Method1Dto): unknown => {
        console.log('PARAM1', { metadata, arg });
        return arg;
      },
    };
  });
};
const Param2 = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter(() => {
    return {
      data: data,
      callback: (metadata, arg: Method2Dto): unknown => {
        console.log('PARAM2', { metadata, arg });
        return arg;
      },
    };
  });
};

class MainClass {}

class BaseClass extends MainClass {}

class Method1Dto {
  public param1: number;
  public param2: number;
}

class Method2Dto {
  public param1: number;
  public param2: number;
}

class MethodEntity {
  public param1: number;
  public param2: number;
}

@ClassDecorator('TestClass')
class TestClass extends BaseClass {
  @Method('testMethod')
  public testMethod(
    @Param1('Param1') // @Param2('Param2')
    param: Method1Dto,
    // @Param2('Param2')
    param2?: Method2Dto,
  ): MethodEntity {
    console.info(`${this.constructor.name}->${this.testMethod.name}()`);
    console.warn(param);
    return { param1: param.param1 * 10, param2: param.param2 * 10 };
  }
}

export function run(): void {
  const param1 = DataHelper.randomFloat(1, 10);
  const param2 = DataHelper.randomFloat(1, 10);
  const dto = {
    param1,
    param2,
  };
  const mock = new TestClass();
  const result = mock.testMethod(dto, dto);
  console.log(result.param1);
}
