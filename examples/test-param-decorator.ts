import { MethodDecoratorNew, ParamDecorator, ParamDecoratorNew } from '../src';
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

const ParamCallback = (callback: Function): ParameterDecorator => {
  const handler: CallableFunction = function (payload: string): string {
    // console.log({ payload });
    return callback(payload);
  };
  return ParamDecoratorNew(ParamCallback.name, handler);
};
const ParamPayload = (payload: string): ParameterDecorator => {
  console.log({ payload });
  const handler: CallableFunction = function (payload: string, data: string): string {
    console.log({ payload, data });
    return `${ParamPayload.name}: ${data}`;
  };
  return ParamDecoratorNew(ParamPayload.name, handler, payload);
};

class MockClass {
  @Method()
  public multiple(@Param1('multiple-1') @Param2() name: string, @Param2() surname: string): void {
    logNameData(Param1.name, name);
    logNameData(Param2.name, surname);
  }

  public method(data: string): void {
    logNameData('method', data);
  }

  @MethodDecoratorNew()
  public test(
    @ParamPayload('param payload') // @ParamCallback((item: string) => item.toUpperCase()) // @ParamUpper((item: string) => item + 'IPSUM')
    data: string,
  ): void {
    // console.log(`CONSTRUCTOR: ${this.constructor.name}`);
    // console.log(`FUNCTION: `, this.test);
    // logNameData(this.test.name ? this.test.name : 'undefined', data);
    this.method(data);
  }
}

export function testParamDecorator(): void {
  const mock = new MockClass();
  // mock.multiple1('Name', 'Surname');
  /**
   *
   */
  mock.test('testData');
}
