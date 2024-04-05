import { DecoratorHelper, DecoratorPayloadType } from '../src/decorator/decorator';
import { IsNumber, IsString } from 'class-validator';
import { ConsoleHelper, ValidatorHelper } from '../src';
import { plainToInstance } from 'class-transformer';

const Decorator = new DecoratorHelper('__FA_DECORATOR__');
const Method = (): MethodDecorator => {
  return Decorator.decorateMethod();
};
const ParamString = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter((payload: { data: string; type: object }): string => {
    return payload.data + '/' + data;
  });
};
const ParamEntity = (): ParameterDecorator => {
  return Decorator.decorateParameter(({ data, type }: DecoratorPayloadType): unknown => {
    const dto = plainToInstance(type, data, {
      enableImplicitConversion: false,
      exposeDefaultValues: false,
      exposeUnsetFields: true,
    });
    const errors = ValidatorHelper.validateSync(dto, {
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
    });
    if (errors) {
      console.error(errors);
    }
    return dto;
  });
};

class Entity {
  @IsNumber()
  public key: number;

  @IsString()
  public value: string;
}

/**
 *
 */
class MockClass {
  private readonly console: ConsoleHelper;

  public constructor() {
    this.console = new ConsoleHelper({ link: false });
  }

  @Method()
  public testMethodChain(@ParamString('3') data: string): void {
    this.console.log(this.constructor.name, this.testMethod.name);
    console.info({ data });
  }

  @Method()
  public testMethod(@ParamString('1') @ParamString('2') data1: string, @ParamEntity() data2: Entity): void {
    this.console.log(this.constructor.name, this.testMethod.name);
    console.info({
      data1,
      data2,
    });
    this.testMethodChain(data1);
  }
}

export function testParamDecorator(): void {
  const mock = new MockClass();
  /**
   *
   */
  mock.testMethod('data', { key: 123, value: 'test' } as unknown as Entity);
}
