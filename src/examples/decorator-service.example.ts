import { DecoratorService } from '../index';

class MainClass {}

class BaseClass extends MainClass {}

class Param1Dto {
  public key1: number;
  public key2: number;
}

class Param2Dto {
  public key1: number;
  public key2: number;
}

class MethodEntity {
  public value1: number;
  public value2: number;
}

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
      before: (metadata, params): unknown[] => {
        // console.log('BEFORE', metadata);
        // @ts-ignore
        console.log('BEFORE', params);
        // @ts-ignore
        (params[0] as Param1Dto).key1 = (params[0] as Param1Dto).key1 + 3;
        // @ts-ignore
        (params[0] as Param1Dto).key2 = (params[0] as Param1Dto).key2 + 3;
        console.log('BEFORE', params);
        // @ts-ignore
        return params;
      },
      after: (metadata, result): unknown => {
        // console.log('AFTER', metadata);
        console.log('AFTER', result);
        // @ts-ignore
        (result[0] as MethodEntity).value1 = (result[0] as MethodEntity).value1 + 4;
        // @ts-ignore
        (result[0] as MethodEntity).value2 = (result[0] as MethodEntity).value2 + 4;
        // console.log('AFTER', args);
        return result;
      },
    };
  });
};
const Param1 = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter(() => {
    return {
      data: data,
      callback: (metadata, arg: Param1Dto): unknown => {
        console.log('PARAM1', arg);
        // console.log('PARAM1', metadata);
        return arg;
      },
    };
  });
};
const Param2 = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter(() => {
    return {
      data: data,
      callback: (metadata, arg: Param2Dto): unknown => {
        console.log('PARAM2', arg);
        // console.log('PARAM2', metadata);
        return arg;
      },
    };
  });
};
// @ClassDecorator('TestClassSync')
// class TestClassSync extends BaseClass {
//   @Method('testMethod')
//   public testMethod(
//     @Param1('Param1') // @Param2('Param2')
//     param: Param1Dto,
//     @Param2('Param2')
//     param2?: Param2Dto,
//   ): MethodEntity {
//     console.info(`${this.constructor.name}->${this.testMethod.name}()`, { param, param2 });
//     return { param1: param.param1 + 1, param2: param.param2 + 1 };
//   }
// }
@ClassDecorator('TestClassAsync')
class TestClassAsync extends BaseClass {
  @Method('testMethod')
  public async testMethodAsync(
    @Param1('Param1') // @Param2('Param2')
    param: Param1Dto,
    @Param2('Param2')
    param2: Param2Dto,
  ): Promise<MethodEntity[]> {
    console.info(`${this.constructor.name}->${this.testMethodAsync?.name}()`, { param, param2 });
    return await new Promise((resolve) => {
      resolve([
        {
          value1: param.key1 * 10,
          value2: param.key2 * 10,
        },
        {
          value1: param2.key1 * 10,
          value2: param2.key2 * 10,
        },
      ]);
    });
  }
}

export async function runDecoratorServiceAsync(): Promise<void> {
  const dto: Param1Dto = {
    key1: 1,
    key2: 2,
  };
  const dto2: Param2Dto = {
    key1: 10,
    key2: 20,
  };
  const testClassAsync = new TestClassAsync();
  // const resultAsync = await testClassAsync.testMethodAsync(dto);
  const resultAsync = await testClassAsync.testMethodAsync(dto, dto2);
  console.warn('RESULT', resultAsync);
}

export function runDecoratorServiceSync(): void {
  // const dto = {
  //   param1: 10,
  //   param2: 20,
  // };
  // const dto2 = {
  //   param1: 1,
  //   param2: 2,
  // };
  // const testClass = new TestClassSync();
  // const result = testClass.testMethod(dto, dto2);
  // console.log('RESULT', result);
}
