import { ConsoleHelper, DataHelper, DecoratorHelper, ValidatorHelper } from '../src';
import { IsNumber, IsString } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';

const Decorator = new DecoratorHelper('__FA_DECORATOR__');
const Method = (): MethodDecorator => {
  return Decorator.decorateMethod();
};
const ParamArray = (name: string[]): ParameterDecorator => {
  return Decorator.decorateParameter((data: string): string => {
    return `${data}-[${name.join(', ')}]`;
  });
};
const ParamString = (name: string): ParameterDecorator => {
  return Decorator.decorateParameter((data: string): string => {
    return `${data}-${name}`;
  });
};
const ParamEntity = (): ParameterDecorator => {
  return Decorator.decorateParameter((data: unknown, constructor: ClassConstructor<unknown>): unknown => {
    const dto = plainToInstance(constructor, data, {
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
      console.error({ errors });
      return null;
    }
    return dto;
  });
};

class Entity {
  @IsString()
  public key: string;

  @IsNumber()
  public value: number;
}

/**
 *
 */
class MockClass {
  private readonly console: ConsoleHelper;

  public constructor() {
    this.console = new ConsoleHelper({ date: false, info: true, link: false, color: true });
  }

  @Method()
  public testEntity(@ParamEntity() entity: Entity): void {
    this.console.log(this.constructor.name, this.testEntity.name);
    console.info({ entity });
    this.console.stdout('\n');
  }

  @Method()
  public testMultiple(@ParamString('1') @ParamString('a') data: string): void {
    this.console.log(this.constructor.name, this.testMultiple.name);
    console.info({ data });
    this.console.stdout('\n');
  }

  @Method()
  public testChain(@ParamString('1') data: string): void {
    this.console.log(this.constructor.name, this.testChain.name);
    console.info({ data });
    this.console.stdout('\n');
    this.testChainCallback(data);
  }

  @Method()
  public testChainCallback(@ParamArray(['a', 'b', 'c']) data: string): void {
    this.console.log(this.constructor.name, this.testChainCallback.name);
    console.info({ data });
    this.console.stdout('\n');
  }
}

export function testParamDecorator(): void {
  const mock = new MockClass();
  /**
   *
   */
  mock.testEntity({ key: '65fc5f5e08570267e7a5f292', value: DataHelper.randomFloat(1, 10) });
  mock.testMultiple('multiple');
  mock.testChain('chain');
}
