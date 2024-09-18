import { DecoratorService } from '../index';

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

const Decorator = new DecoratorService('__FA_DECORATOR__');
const ClassDecorator = (data: string): ClassDecorator => {
  return Decorator.decorateClass(() => {
    return {
      data: data,
    };
  });
};
const Method = (data: string): MethodDecorator => {
  // @ts-ignore
  return Decorator.decorateMethod(() => {
    return {
      data: data,
      before: (metadata, ...args): unknown[] => {
        console.log('BEFORE', ...args);
        (args[0] as Method1Dto).param1 = (args[0] as Method1Dto).param1 + 5;
        (args[0] as Method1Dto).param2 = (args[0] as Method1Dto).param2 + 5;
        // console.log('AFTER', ...args);
        console.log('BEFORE', ...args);
        return args;
      },
      after: (metadata, args): unknown => {
        console.log('AFTER', args);
        (args as Method1Dto).param1 = (args as Method1Dto).param1 * 10;
        (args as Method1Dto).param2 = (args as Method1Dto).param2 * 10;
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
        // console.log('PARAM1', { metadata, arg });
        console.log('PARAM1', arg);
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
        // console.log('PARAM2', { metadata, arg });
        console.log('PARAM2', arg);
        return arg;
      },
    };
  });
};

@ClassDecorator('TestClass')
class TestClass extends BaseClass {
  @Method('testMethod')
  public testMethod(
    @Param1('Param1') // @Param2('Param2')
    param: Method1Dto,
    // @Param2('Param2')
    param2?: Method2Dto,
  ): MethodEntity {
    console.info(`${this.constructor.name}->${this.testMethod.name}()`, param);
    console.warn(param);
    return { param1: param.param1 + 1, param2: param.param2 + 1 };
  }
}

@ClassDecorator('TestAsyncClass')
class TestClassAsync extends BaseClass {
  @Method('testMethod')
  public async testMethod(
    @Param1('Param1') // @Param2('Param2')
    param: Method1Dto,
    // @Param2('Param2')
    param2?: Method2Dto,
  ): Promise<MethodEntity> {
    console.info(`${this.constructor.name}->${this.testMethod.name}()`, param);
    return await new Promise((resolve) => {
      resolve({ param1: param.param1 + 1, param2: param.param2 + 1 });
    });
  }
}

export async function runDecoratorServiceAsync(): Promise<void> {
  const param1 = 10;
  const param2 = 20;
  const dto = {
    param1,
    param2,
  };
  const testClassAsync = new TestClassAsync();
  const resultAsync = await testClassAsync.testMethod(dto);
  console.warn('RESULT', resultAsync);
}

export function runDecoratorService(): void {
  const param1 = 10;
  const param2 = 20;
  const dto = {
    param1,
    param2,
  };
  const testClass = new TestClass();
  const result = testClass.testMethod(dto, dto);
  console.log('RESULT', result);
  // const testAsyncClass = new TestAsyncClass();
  // const resultAsync = await testAsyncClass.testMethod(dto);
  // console.warn('RESULT', resultAsync);
}
