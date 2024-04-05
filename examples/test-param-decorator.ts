import { DecorateMethod, DecorateParameter, DecorateParameterType, ParamDecorator, ParamDecoratorNew } from '../src';
import { logNameData } from './common/logger';

function Method(): MethodDecorator {
  return ParamDecorator.decorateMethod();
}

const Param1 = (payload: string): ParameterDecorator => {
  const handler: CallableFunction = function (payload: string, data: string): string {
    return `${payload}-1`;
  };
  return ParamDecorator.decorateParam(Param1.name, handler, payload);
};
const Param2 = (): ParameterDecorator => {
  const handler: CallableFunction = function (payload: string): string {
    return `${payload}-2`;
  };
  return ParamDecorator.decorateParam(Param2.name, handler, null);
};
/**
 *
 */

const ParamCallback = (callback: (data: string) => string): ParameterDecorator => {
  const handler: CallableFunction = function (callback: (data: string) => string, payload: string): string {
    return callback(payload);
  };
  return ParamDecoratorNew(ParamCallback.name, handler, callback);
};
const ParamPayload = (param: string): ParameterDecorator => {
  const handler: CallableFunction = function (param: string, payload: string): string {
    return `${param} -> ${payload}`;
  };
  return ParamDecoratorNew(ParamPayload.name, handler, param);
};

/**
 *
 */
class MockClass {
  // @MethodDecoratorNew()
  // public multiple(
  //   @ParamPayload('multiple-1') @ParamPayload('1') name: string,
  //   @ParamPayload('2') surname: string,
  // ): void {
  //   logNameData(Param1.name, name);
  //   logNameData(Param2.name, surname);
  // }
  public method(data: string): void {
    // logData(this, this.method, this.method.name);
    // logNameData(this.method.name, data);
  }

  // @MethodDecoratorNew()
  @DecorateMethod()
  public test(
    // @ParamPayload('param payload')
    // @paramtypesDecorator((item: string) => `${item} -> callback`)
    @DecorateParameterType()
    data1: string,
    @DecorateParameter()
    data2: string,
  ): void {
    logNameData(this.test.name, { data1, data2 });
    // console.log(`CONSTRUCTOR: ${this.constructor.name}`);
    // console.log(`FUNCTION: `, this.test);
    // logNameData(this.test.name ? this.test.name : 'undefined', data);
    this.method(data1);
  }
}

export function testParamDecorator(): void {
  const mock = new MockClass();
  // mock.multiple1('Name', 'Surname');
  /**
   *
   */
  mock.test('data 1', 'data 2');
}
