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
  return Decorator.decorateClass({
    data: data,
  });
};
const Method = (data: string): MethodDecorator => {
  return Decorator.decorateMethod({
    data: data,
    beforeParameterCallback: (metadata, ...params): unknown[] => {
      console.log('BEFORE', params);
      (params[0] as Param1Dto).key1 = (params[0] as Param1Dto).key1 * 100;
      (params[0] as Param1Dto).key2 = (params[0] as Param1Dto).key2 * 100;
      return params;
    },
    // @ts-ignore
    afterResultCallback1: (metadata, result): unknown[] => {
      console.log('AFTER', metadata);
      const result1 = (result as MethodEntity[])[0];
      const result2 = (result as MethodEntity[])[1];
      result1.value1 = result1.value1 / 2;
      result1.value2 = result1.value2 / 2;
      return [result1, result2];
    },
    afterResultCallback: (metadata, result): unknown => {
      console.log('AFTER', metadata);
      const result1 = result as MethodEntity;
      result1.value1 = result1.value1 / 2;
      return result1;
    },
  });
};
const Param1 = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter({
    data: data,
    callback: (metadata, param: Param1Dto): unknown => {
      console.log('PARAM1', param, metadata.parameterType);
      console.log('PARAM1', metadata);
      return param;
    },
  });
};
const Param2 = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter({
    data: data,
    callback: (metadata, param: Param2Dto): unknown => {
      console.log('PARAM2', param, metadata.parameterType);
      // console.log('PARAM2', metadata);
      return param;
    },
  });
};

@ClassDecorator('TestClassSync')
class TestClassSync extends BaseClass {
  @Method('testMethod')
  public testMethod(
    @Param1('Param1') // @Param2('Param2')
    param: Param1Dto,
    @Param2('Param2')
    param2?: Param2Dto,
  ): MethodEntity {
    console.info(`${this.constructor.name}->${this.testMethod.name}()`, { param, param2 });
    return { value1: param.key1 + 1, value2: param.key2 + 1 };
  }
}

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
        // {
        //   value1: 0,
        //   value2: 0,
        // },
        {
          value1: param.key1 + 1,
          value2: param.key2 + 1,
        },
        {
          value1: param2.key1 - 1,
          value2: param2.key2 - 1,
        },
      ]);
    });
  }
}

export async function runDecoratorServiceAsync(): Promise<void> {
  const dto: Param1Dto = {
    key1: 10,
    key2: 20,
  };
  const dto2: Param2Dto = {
    key1: 5,
    key2: 10,
  };
  const testClassAsync = new TestClassAsync();
  const result = await testClassAsync.testMethodAsync(dto, dto2);
  console.warn('RESULT', result);
}

export function runDecoratorServiceSync(): void {
  const dto: Param1Dto = {
    key1: 10,
    key2: 20,
  };
  const dto2: Param2Dto = {
    key1: 5,
    key2: 10,
  };
  const testClass = new TestClassSync();
  const result = testClass.testMethod(dto, dto2);
  console.log('RESULT', result);
}
